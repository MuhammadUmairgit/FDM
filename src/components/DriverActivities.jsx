// DriverActivities.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  Button,
  Divider,
  Typography,
  Spin,
  message,
  Modal,
} from "antd";
import { LeftOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import ReactApexChart from "react-apexcharts";
// API hooks
import { useQueryGetDriverLookup } from "src/queries/driver.queries";
import { useQueryGetTachoDriverActivity } from "src/queries/tacho.queries";

dayjs.extend(isBetween);

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text, Title } = Typography;

/* ------------------------------------------------------------------
 *  Static driver states used by the UI. Additional states coming from
 *  the backend will be merged in runtime so that the component is able
 *  to display them without crashing / requiring a new deploy.
 * ------------------------------------------------------------------*/
const BASE_DRIVER_STATES = {
  DRIVING: { name: "Driving (within limit)", color: "#52c41a" },
  DRIVING_WARNING: { name: "Driving (approaching 4h30)", color: "#faad14" },
  DRIVING_VIOLATION: { name: "Driving (over 4h30)", color: "#f5222d" },
  BREAK: { name: "Break", color: "#1890ff" },
  REST: { name: "Rest", color: "#722ed1" },
  AVAILABLE: { name: "Available", color: "#13c2c2" },
  WORK: { name: "Work (not driving)", color: "gray" },
};

// Helper that converts a duration string like "2h15" or "45m" to minutes
const getMinutesFromDuration = (durationStr = "") => {
  // Matches groups like "2h" and/or "15m"
  const match = durationStr.match(/(?:(\d+)h)?(?:(\d+)m)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  return hours * 60 + minutes;
};

const DriverActivities = ({ driverId: propDriverId, vehiclePlate, fromVehicleView }) => {
  /* ----------------------------- component state ----------------------------- */
  const [dateRange, setDateRange] = useState([dayjs().subtract(6, "days"), dayjs()]);
  const [hoverRange, setHoverRange] = useState([]); // For the RangePicker footer
  const [vehicleFilter, setVehicleFilter] = useState(vehiclePlate || null);
  const [driverId, setDriverId] = useState(propDriverId || null);
  const [modalVisible, setModalVisible] = useState(false);

  /* --------------------------- fetch driver lookup --------------------------- */
  const {
    data: driverLookupData,
    isLoading: driverLookupLoader,
  } = useQueryGetDriverLookup();

  // When we receive the lookup set the first driver as default (unless external driverId is provided)
  useEffect(() => {
    if (!propDriverId && driverLookupData?.response?.length) {
      setDriverId(driverLookupData.response[0].id);
    }
  }, [driverLookupData, propDriverId]);

  /* --------------------- fetch activities for selected driver ---------------- */
  const {
    data: tachoDriverActivityData,
    isLoading: tachoDriverActivityLoader,
  } = useQueryGetTachoDriverActivity(
    {
      driverId,
      from: dateRange[0]?.format("YYYY-MM-DD 00:00:00"),
      to: dateRange[1]?.format("YYYY-MM-DD 23:59:59"),
    },
    !!driverId // enabled flag: only fetch when we have a driver
  );

  /* ----------------------------- derived helpers ----------------------------- */
  const activityData = tachoDriverActivityData?.response || null;

  // Collect additional states that might come from the backend & merge with local ones
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

  // y-axis categories: one row per day in the response (or empty array while loading)
  const yCategories = (activityData?.days || []).map((day) => day.dayOfTheWeek ?? "");

  // series: for each state we sum its duration for every day (convert to hours)
  const chartSeries = useMemo(() => {
    return DRIVER_STATE_KEYS.map((stateKey) => ({
      name: DRIVER_STATES[stateKey].name,
      data: (activityData?.days || []).map((day) => {
        const minutesForState = (day.activities || [])
          .filter((a) => a.workingState === stateKey)
          .reduce((sum, a) => sum + getMinutesFromDuration(a.duration), 0);
        return minutesForState / 60; // convert to hours for the chart
      }),
    }));
  }, [DRIVER_STATE_KEYS, DRIVER_STATES, activityData]);

  /* --------------------------- chart configuration --------------------------- */
  const barHeightPx = (420 * 0.8) / ((activityData?.days?.length || 1));

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
        style: { fontWeight: 600 },
      },
    },
    yaxis: {
      categories: yCategories,
      title: { text: "Day" },
      labels: { style: { fontWeight: 600 } },
    },
    colors: DRIVER_STATE_KEYS.map((k) => DRIVER_STATES[k].color),
    tooltip: {
      shared: false,
      intersect: true,
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        const seriesName = w.globals.seriesNames[seriesIndex];
        const value = series[seriesIndex][dataPointIndex];
        if (value === 0) return "";
        return `
          <div style="padding:8px;background:white;border-radius:4px;box-shadow:0 2px 6px rgba(0,0,0,0.15)">
            <div style="font-weight:600;color:black">${seriesName}: ${value.toFixed(2)}h</div>
          </div>`;
      },
    },
    legend: { show: false },
    dataLabels: { enabled: false },
    grid: { xaxis: { lines: { show: false } } },
  };

  /* --------------------------- user interaction handlers --------------------------- */
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
    if (!propDriverId) setDriverId(null);
    setVehicleFilter(null);
    message.success("Reset to last 7 days");
  };

  /* ------------------------------ UI rendering ------------------------------ */
  const isLoading = driverLookupLoader || tachoDriverActivityLoader;

  return (
    <Card>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginTop: 40, marginBottom: 30 }}>
        <Col>
          {fromVehicleView && (
            <Button icon={<LeftOutlined />} onClick={() => window.history.back()} style={{ marginRight: 16 }} />
          )}
          <Title level={4} style={{ margin: 0 }}>
            Driver Activities
          </Title>
        </Col>
        <Col>
          <Button icon={<ReloadOutlined />} onClick={handleReset} type="primary">
            Reset to Last 7 Days
          </Button>
        </Col>
      </Row>

      {/* Filters */}
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
          >
            {/* Vehicle filtering kept for backward-compatibility. */}
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
                  Select up to 7 days.{' '}
                  {hoverRange[0] && hoverRange[1] && (
                    <span>
                      Selected: {hoverRange[1].diff(hoverRange[0], 'days') + 1} days
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

      {/* Driver & date range label */}
      <div style={{ marginBottom: 24 }}>
        <Title level={5}>
          {driverId
            ? driverLookupData?.response?.find((d) => d.id === driverId)?.name
            : 'Select a driver'}{' '}
          • {dateRange[0]?.format('MMM D') || 'N/A'} - {dateRange[1]?.format('MMM D, YYYY') || 'N/A'}
          {vehicleFilter && ` • Vehicle: ${vehicleFilter}`}
        </Title>
      </div>

      {/* Main content */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 420 }}>
          <Spin size="large" />
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 24, overflowX: 'auto', alignItems: 'flex-start' }}>
          {/* Chart */}
          <div style={{ flex: 1, minWidth: 700 }}>
            {activityData?.days?.length ? (
              <ReactApexChart
                key={activityData.days.map((d) => d.dayOfTheWeek).join('-')}
                options={chartOptions}
                series={chartSeries}
                type="bar"
                height={420}
              />
            ) : (
              <Text type="secondary">No data available for the selected range.</Text>
            )}
          </div>

          {/* Commitment side list */}
          {activityData?.days?.length ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                minWidth: 130,
                marginTop: 24,
                fontSize: 14,
              }}
            >
              {activityData.days.map((day, idx) => (
                <div
                  key={idx}
                  style={{
                    height: barHeightPx,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: idx !== activityData.days.length - 1 ? '1px solid #f0f0f0' : 'none',
                    boxSizing: 'border-box',
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

      <Divider />

      {/* Legend */}
      <div>
        <Title level={5}>Legend</Title>
        <Row gutter={16}>
          {Object.entries(DRIVER_STATES).map(([key, config]) => (
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
                <Text>{config.name}</Text>
              </Row>
            </Col>
          ))}
        </Row>
      </div>
    </Card>
  );
};

export default DriverActivities;