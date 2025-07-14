import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  Button,
  Typography,
  Spin,
  message,
  Modal,
} from "antd";
import { LeftOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

dayjs.extend(isBetween);

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text, Title } = Typography;

// Mock query hooks - replace with actual implementations
const useQueryGetDriverLookup = () => ({
  data: null,
  isLoading: false,
});

const useQueryGetTachoDriverActivity = (params, enabled) => ({
  data: null,
  isLoading: false,
});

const BASE_DRIVER_STATES = {
  DRIVING: { name: "Driving (within limit)", color: "#52c41a" },
  DRIVING_WARNING: { name: "Driving (approaching 4h30)", color: "#faad14" },
  DRIVING_VIOLATION: { name: "Driving (over 4h30)", color: "#f5222d" },
  BREAK: { name: "Break", color: "#1890ff" },
  REST: { name: "Rest", color: "#722ed1" },
  AVAILABLE: { name: "Available", color: "#13c2c2" },
  WORK: { name: "Work (not driving)", color: "gray" },
};

const getMinutesFromDuration = (durationStr = "") => {
  const match = durationStr.match(/(?:(\d+)h)?(?:(\d+)m)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  return hours * 60 + minutes;
};

const DriverActivities = ({
  driverId: propDriverId,
  vehiclePlate,
  fromVehicleView,
}) => {
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(6, "days"),
    dayjs(),
  ]);
  const [hoverRange, setHoverRange] = useState([]);
  const [vehicleFilter, setVehicleFilter] = useState(vehiclePlate || null);
  const [driverId, setDriverId] = useState(propDriverId || null);
  const [modalVisible, setModalVisible] = useState(false);

  const { data: driverLookupData, isLoading: driverLookupLoader } =
    useQueryGetDriverLookup();

  useEffect(() => {
    if (!propDriverId && driverLookupData?.response?.length) {
      setDriverId(driverLookupData.response[0].id);
    }
  }, [driverLookupData, propDriverId]);

  const {
    data: tachoDriverActivityData,
    isLoading: tachoDriverActivityLoader,
  } = useQueryGetTachoDriverActivity(
    {
      driverId,
      from: dateRange[0]?.format("YYYY-MM-DD 00:00:00"),
      to: dateRange[1]?.format("YYYY-MM-DD 23:59:59"),
    },
    !!driverId
  );

  const activityData = tachoDriverActivityData?.response || null;

  const commitmentByState = useMemo(() => {
    const summary = {};
    (activityData?.days || []).forEach((day) => {
      (day.activities || []).forEach((a) => {
        if (!summary[a.workingState]) summary[a.workingState] = 0;
        summary[a.workingState] += getMinutesFromDuration(a.duration);
      });
    });

    const result = {};
    for (const key in summary) {
      result[key] = (summary[key] / 60).toFixed(2);
    }
    return result;
  }, [activityData]);

  const DRIVER_STATES = useMemo(() => {
    const extraStates = (activityData?.days || []).reduce((acc, day) => {
      (day.activities || []).forEach((a) => {
        if (a.workingState && !BASE_DRIVER_STATES[a.workingState]) {
          acc[a.workingState] = { name: a.workingState, color: "#cccccc" };
        }
      });
      return acc;
    }, {});

    return { ...BASE_DRIVER_STATES, ...extraStates };
  }, [activityData]);

  const DRIVER_STATE_KEYS = Object.keys(DRIVER_STATES);

  // Fixed: Improved chart data generation with fallback values for day labels
  const chartData = useMemo(() => {
    return (activityData?.days || []).map((day, index) => {
      // Use dayOfTheWeek if available, otherwise create a fallback label
      let dayLabel = "";
      if (day.dayOfTheWeek && day.dayOfTheWeek.trim() !== "") {
        dayLabel = day.dayOfTheWeek;
      } else if (day.date) {
        dayLabel = dayjs(day.date).format("ddd MMM D");
      } else {
        dayLabel = `Day ${index + 1}`;
      }

      const dayData = { day: dayLabel };

      // Calculate hours for each state
      DRIVER_STATE_KEYS.forEach((stateKey) => {
        const minutesForState = (day.activities || [])
          .filter((a) => a.workingState === stateKey)
          .reduce((sum, a) => sum + getMinutesFromDuration(a.duration), 0);
        dayData[stateKey] = Number((minutesForState / 60).toFixed(2));
      });

      return dayData;
    });
  }, [activityData, DRIVER_STATE_KEYS]);

  const totalDays =
    dateRange && dateRange[0] && dateRange[1]
      ? dateRange[1].diff(dateRange[0], "days") + 1
      : 1;

  const rangePresets = [
    { label: "Last 7 Days", value: [dayjs().subtract(6, "days"), dayjs()] },
    { label: "Last 3 Days", value: [dayjs().subtract(2, "days"), dayjs()] },
    { label: "Today", value: [dayjs(), dayjs()] },
  ];

  const disabledDate = (current) => current && current > dayjs().endOf("day");

  const handleDateChange = (dates) => {
    if (modalVisible) return;
    if (dates && dates[0] && dates[1]) {
      const diffInDays = dates[1].diff(dates[0], "days");
      if (diffInDays > 6) {
        setModalVisible(true);
        Modal.error({
          title: "Invalid Date Range",
          content: "Maximum date range is 7 days",
          onOk: () => setModalVisible(false),
        });
        return;
      }
      if (dates[1].isAfter(dayjs())) {
        setModalVisible(true);
        Modal.error({
          title: "Invalid Date Selection",
          content: "Future dates are not allowed",
          onOk: () => setModalVisible(false),
        });
        return;
      }
      setDateRange(dates);
    }
  };

  const handleHoverChange = (dates) => setHoverRange(dates || []);

  const handleReset = () => {
    setDateRange([dayjs().subtract(6, "days"), dayjs()]);
    setVehicleFilter(null);
    message.success("Reset to last 7 days");
  };

  const isLoading = driverLookupLoader || tachoDriverActivityLoader;

  return (
    <Card>
      <Row
        justify="space-between"
        align="middle"
        style={{ marginTop: 40, marginBottom: 30 }}
      >
        <Col>
          {fromVehicleView && (
            <Button
              icon={<LeftOutlined />}
              onClick={() => window.history.back()}
              style={{ marginRight: 16 }}
            />
          )}
          <Title level={4} style={{ margin: 0 }}>
            Driver Activities
          </Title>
        </Col>
        <Col>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleReset}
            type="primary"
          >
            Reset to Last 7 Days
          </Button>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        {!propDriverId && (
          <Col span={6}>
            <Select
              placeholder="Select Driver"
              style={{ width: "100%" }}
              value={driverId}
              onChange={setDriverId}
              allowClear
              loading={driverLookupLoader}
            >
              {driverLookupData?.response?.map((driver) => (
                <Option key={driver.id} value={driver.id}>
                  {driver.name}
                </Option>
              ))}
            </Select>
          </Col>
        )}
        <Col span={6}>
          <Select
            placeholder="Filter by Vehicle"
            style={{ width: "100%" }}
            value={vehicleFilter}
            onChange={setVehicleFilter}
            allowClear
          />
        </Col>
        <Col span={12}>
          <RangePicker
            style={{ width: "100%", marginTop: 1 }}
            value={dateRange}
            onChange={handleDateChange}
            onCalendarChange={handleHoverChange}
            disabledDate={disabledDate}
            allowClear={false}
            presets={rangePresets}
            renderExtraFooter={() => (
              <div style={{ padding: 8 }}>
                <Text type="secondary">
                  Select up to 7 days.{" "}
                  {hoverRange[0] && hoverRange[1] && (
                    <span>
                      Selected: {hoverRange[1].diff(hoverRange[0], "days") + 1}{" "}
                      days
                    </span>
                  )}
                </Text>
              </div>
            )}
          />
          <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
            Maximum date range: 7 days
          </Text>
        </Col>
      </Row>

      <div style={{ marginBottom: 24 }}>
        <Title level={5}>
          {driverId
            ? driverLookupData?.response?.find((d) => d.id === driverId)?.name
            : "Select a driver"}{" "}
          • {dateRange[0]?.format("MMM D") || "N/A"} -{" "}
          {dateRange[1]?.format("MMM D, YYYY") || "N/A"}
          {vehicleFilter && ` • Vehicle: ${vehicleFilter}`}
        </Title>
      </div>

      {isLoading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 420,
          }}
        >
          <Spin size="large" />
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            gap: 24,
            overflowX: "auto",
            alignItems: "flex-start",
          }}
        >
          <div style={{ flex: 1, minWidth: 700 }}>
            {chartData.length ? (
              <ResponsiveContainer width="100%" height={420}>
                <BarChart
                  data={chartData}
                  layout="horizontal"
                  margin={{ top: 20, right: 30, left: 120, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    domain={[0, totalDays * 8]}
                    tickFormatter={(value) => `${value}h`}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="day" 
                    width={100}
                    tick={{ fontSize: 12, fontWeight: 600 }}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      `${value.toFixed(2)}h`,
                      DRIVER_STATES[name]?.name || name
                    ]}
                  />
                  <Legend />
                  {DRIVER_STATE_KEYS.map((stateKey) => (
                    <Bar
                      key={stateKey}
                      dataKey={stateKey}
                      stackId="activities"
                      fill={DRIVER_STATES[stateKey].color}
                      name={DRIVER_STATES[stateKey].name}
                      radius={[0, 3, 3, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Text type="secondary">
                No data available for the selected range.
              </Text>
            )}
          </div>

          {activityData?.days?.length ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                minWidth: 130,
                marginTop: 24,
                fontSize: 14,
              }}
            >
              {activityData.days.map((day, idx) => (
                <div
                  key={idx}
                  style={{
                    height: 420 / (activityData.days?.length || 1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom:
                      idx !== activityData.days.length - 1
                        ? "1px solid #f0f0f0"
                        : "none",
                    boxSizing: "border-box",
                  }}
                >
                  <Text>Commitment:</Text>
                  <Text strong>{day.commitment}</Text>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <Title level={5}>Legend</Title>
        <Row gutter={16}>
          {Object.entries(DRIVER_STATES)
            .filter(([key]) => parseFloat(commitmentByState[key] || "0") > 0)
            .map(([key, config]) => (
              <Col key={key} style={{ marginBottom: 8 }}>
                <Row align="middle">
                  <div
                    style={{
                      backgroundColor: config.color,
                      width: 20,
                      height: 20,
                      marginRight: 8,
                      borderRadius: 4,
                    }}
                  />
                  <Text>
                    {config.name} • {commitmentByState[key]}h
                  </Text>
                </Row>
              </Col>
            ))}
        </Row>
      </div>
    </Card>
  );
};

export default DriverActivities;