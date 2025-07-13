import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  Button,
  Divider,
  Typography,
  message,
  Modal,
  Spin,
} from "antd";
import { LeftOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import ReactApexChart from "react-apexcharts";
import { useQueryGetDriverLookup } from "src/queries/driver.queries";
import { useQueryGetTachoDriverActivity } from "src/queries/tacho.queries";
dayjs.extend(isBetween);

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text, Title } = Typography;

const DRIVER_STATES = {
  DRIVING: { name: "Driving", color: "#52c41a" },
  BREAK: { name: "Break", color: "#1890ff" },
  REST: { name: "Rest", color: "#722ed1" },
  AVAILABLE: { name: "Available", color: "#13c2c2" },
  WORK: { name: "Work", color: "#faad14" },
  UNKNOWN: { name: "Unknown", color: "#d9d9d9" },
};

const getMinutesFromDuration = (durationStr) => {
  const match = durationStr.match(/(\d+)h(?:(\d+))?/);
  if (!match) return 0;
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2] || "0", 10);
  return hours * 60 + minutes;
};

const getActivityColor = (activity) => {
  if (
    activity.stateType?.includes("VIOLATION") ||
    activity.stateType?.includes("DAILY_DRIVING_TIME_VIOLATION")
  ) {
    return "#f5222d"; // Red
  }
  if (
    activity.stateType?.includes("WARNING") ||
    activity.stateType?.includes("APPROACHING")
  ) {
    return "#faad14"; // Yellow/Orange
  }
  return DRIVER_STATES[activity.workingState]?.color || "#d9d9d9";
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
  const [driverId, setDriverId] = useState(propDriverId || null);
  const [vehicleFilter, setVehicleFilter] = useState(vehiclePlate || null);
  const [hoverRange, setHoverRange] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const { data: driverLookupData, isLoading: driverLookupLoader } =
    useQueryGetDriverLookup();

  const {
    data: tachoDriverActivityData,
    isLoading: tachoDriverActivityLoader,
    refetch: refetchTachoData,
  } = useQueryGetTachoDriverActivity(
    {
      driverId,
      from: dateRange[0]?.format("YYYY-MM-DD 00:00:00"),
      to: dateRange[1]?.format("YYYY-MM-DD 00:00:00"),
    },
    !!driverId
  );

  useEffect(() => {
    if (driverLookupData?.response && !propDriverId) {
      setDriverId(driverLookupData.response?.[0]?.id || null);
    }
  }, [driverLookupData, propDriverId]);

  const showModalError = (() => {
    let isShown = false;
    return (title, content) => {
      if (isShown) return;
      isShown = true;
      Modal.error({
        title,
        content,
        centered: true,
        onOk: () => (isShown = false),
      });
    };
  })();

  const handleDateChange = (dates) => {
    if (!dates || !dates[0] || !dates[1]) return;
    const diffInDays = dates[1].diff(dates[0], "days");
    const isFuture = dates[1].isAfter(dayjs(), "day");

    if (diffInDays > 6) {
      showModalError("Invalid Date Range", "Maximum date range is 7 days");
      return;
    }
    if (isFuture) {
      showModalError("Invalid Date", "Future dates are not allowed");
      return;
    }

    setDateRange(dates);
  };

  const handleHoverChange = (dates) => setHoverRange(dates || []);

  const handleReset = () => {
    const resetRange = [dayjs().subtract(6, "days"), dayjs()];
    setDateRange(resetRange);
    if (!propDriverId) setDriverId(null);
    setVehicleFilter(null);
    message.success("Reset to last 7 days");
  };

  const disabledDate = (current) => current && current > dayjs().endOf("day");

  // Get activity data from API
  const activityData = tachoDriverActivityData?.response;

  // Get all unique working states from the API response
  const apiWorkingStates = new Set();
  activityData?.days?.forEach((day) => {
    day.activities?.forEach((activity) => {
      if (activity.workingState) {
        apiWorkingStates.add(activity.workingState);
      }
    });
  });

  // Combine API states with default DRIVER_STATES
  const DRIVER_STATES_FROM_API = {
    ...DRIVER_STATES,
    // Add any additional states from API that aren't in DRIVER_STATES
    ...Array.from(apiWorkingStates).reduce((acc, state) => {
      if (!DRIVER_STATES[state]) {
        acc[state] = {
          name: state,
          color: "#cccccc", // Default color for unknown states
        };
      }
      return acc;
    }, {}),
  };

  const DRIVER_STATE_KEYS = Object.keys(DRIVER_STATES_FROM_API);

  // Convert API data to chart format
  const convertApiDataToChartFormat = () => {
    if (!activityData?.days) return [];
    
    return activityData.days.map((day) => {
      const dayStates = [];
      
      if (day.activities && day.activities.length > 0) {
        day.activities.forEach((activity) => {
          const durationMinutes = getMinutesFromDuration(activity.duration);
          dayStates.push({
            state: activity.workingState,
            duration: durationMinutes,
            startTime: activity.startTime,
            endTime: activity.endTime,
          });
        });
      }
      
      return {
        dayOfTheWeek: day.dayOfTheWeek,
        commitment: day.commitment,
        states: dayStates,
        isEmpty: !day.activities || day.activities.length === 0,
      };
    });
  };

  const chartData = convertApiDataToChartFormat();

  const chartSeries = DRIVER_STATE_KEYS.map((stateKey) => ({
    name: DRIVER_STATES_FROM_API[stateKey].name,
    data: chartData.map((day) =>
      day.isEmpty
        ? 0
        : day.states
            .filter((s) => s.state === stateKey)
            .reduce((sum, s) => sum + s.duration, 0) / 60
    ),
  }));

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const barHeightPx = (420 * 0.8) / (chartData.length || 7);

  const chartOptions = {
    chart: {
      type: "bar",
      stacked: true,
      height: 420,
      toolbar: { show: false },
      animations: { enabled: true },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "80%",
        borderRadius: 6,
      },
    },
    xaxis: {
      min: 0,
      max: 24,
      tickAmount: 6,
      title: { text: "Time (hours)" },
      labels: {
        formatter: (val) => `${val}:00`,
        style: { fontWeight: "600" },
      },
    },
    yaxis: {
      categories: chartData.map((day) => {
        const dayIndex = day.dayOfTheWeek;
        return daysOfWeek[dayIndex] || `Day ${dayIndex}`;
      }),
      title: { text: "Day" },
      labels: {
        style: { fontWeight: "600" },
      },
    },
    colors: DRIVER_STATE_KEYS.map((k) => DRIVER_STATES_FROM_API[k].color),
    tooltip: {
      shared: false,
      intersect: true,
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        const seriesName = w.globals.seriesNames[seriesIndex];
        const value = series[seriesIndex][dataPointIndex];
        if (value === 0) return "";

        return `
          <div class="custom-tooltip" style="padding: 8px; background: white; border-radius: 4px; box-shadow: 0 2px 6px rgba(0,0,0,0.15);">
            <div style="font-weight: 600; color: Black">${seriesName}: ${value.toFixed(2)}h</div>
          </div>
        `;
      },
    },
    legend: { show: false },
    dataLabels: { enabled: false },
    grid: { xaxis: { lines: { show: false } } },
  };

  const rangePresets = [
    { label: "Last 7 Days", value: [dayjs().subtract(6, "days"), dayjs()] },
    { label: "Last 3 Days", value: [dayjs().subtract(2, "days"), dayjs()] },
    { label: "Today", value: [dayjs(), dayjs()] },
  ];

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
          >
            {/* Vehicle options would come from another API call */}
          </Select>
        </Col>
        <Col span={12}>
          <RangePicker
            style={{ width: "100%" }}
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
          {activityData?.driverName || "Select a driver"} • {activityData?.weekRange || "N/A"}
          {vehicleFilter && ` • Vehicle: ${vehicleFilter}`}
        </Title>
      </div>

      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 400 }}>
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
            <ReactApexChart
              key={`chart-${driverId}-${dateRange[0]?.format("YYYY-MM-DD")}-${dateRange[1]?.format("YYYY-MM-DD")}`}
              options={chartOptions}
              series={chartSeries}
              type="bar"
              height={420}
            />
          </div>
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
            {chartData.map((day, idx) => (
              <div
                key={idx}
                style={{
                  height: barHeightPx,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottom:
                    idx !== chartData.length - 1
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
        </div>
      )}

      <Divider />

      <div>
        <Title level={5}>Legend</Title>
        <Row gutter={16}>
          {Array.from(apiWorkingStates)
            .filter((state) => DRIVER_STATES_FROM_API[state])
            .map((state) => (
              <Col key={state} style={{ marginBottom: 8 }}>
                <Row align="middle">
                  <div
                    style={{
                      backgroundColor: DRIVER_STATES_FROM_API[state].color,
                      width: 20,
                      height: 20,
                      marginRight: 8,
                      borderRadius: 4,
                    }}
                  />
                  <Text>{DRIVER_STATES_FROM_API[state].name}</Text>
                </Row>
              </Col>
            ))}
        </Row>
      </div>
    </Card>
  );
};

export default DriverActivities;