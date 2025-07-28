import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Box,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Divider,
  Tooltip,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ArrowBack, Refresh, Info } from "@mui/icons-material";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import ReactApexChart from "react-apexcharts";

dayjs.extend(isBetween);

const DRIVER_STATES = {
  DRIVING: { name: "Ore di guida", color: "#52c41a" },
  REST: { name: "A riposo", color: "#f5222d" },
  WORK: { name: "Lavoro", color: "#faad14" },
  AVAILABLE: { name: "Disponibile", color: "#13c2c2" },
  REAL_TIME_DATA: { name: "Dati in tempo reale (can, flotta)", color: "#ff7875" },
  DDD_FILE_DATA: { name: "File dati DDD", color: "#52c41a" },
  NO_DATA: { name: "Nessun dato", color: "#d9d9d9" },
};

const DRIVER_STATE_KEYS = Object.keys(DRIVER_STATES);

// Data source types for tracking DDD overwrites
const DATA_SOURCES = {
  TACHO_SERVICE: {
    key: "tacho_service",
    name: "Tacho Service",
    description: "Data obtained from tachograph service",
    color: "#1976d2",
    backgroundColor: "transparent",
    borderStyle: "1px solid #e0e0e0",
  },
  DDD_OVERWRITE: {
    key: "ddd_overwrite",
    name: "DDD File",
    description: "Real data overwritten by DDD file (tachograph data)",
    color: "#4caf50",
    backgroundColor: "rgba(76, 175, 80, 0.08)",
    borderStyle: "3px solid #4caf50",
  },
};

const DDDTab = ({
  driverId: propDriverId,
  vehiclePlate,
  fromVehicleView,
  apiActivitiesData,
}) => {
  const [driverId, setDriverId] = useState(propDriverId || null);
  const [startDate, setStartDate] = useState(dayjs().subtract(6, "days"));
  const [endDate, setEndDate] = useState(dayjs());
  const [loading, setLoading] = useState(false);
  const [activitiesData, setActivitiesData] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [vehicleFilter, setVehicleFilter] = useState(vehiclePlate || null);
  const [errorDialog, setErrorDialog] = useState({ open: false, message: "" });
  const [successMessage, setSuccessMessage] = useState("");

  const generateTimelineData = () => {
    const timelineData = [];
    const startDateObj = startDate
      ? startDate.startOf("day")
      : dayjs().subtract(6, "days").startOf("day");
    const endDateObj = endDate
      ? endDate.startOf("day")
      : dayjs().startOf("day");
    const daysInRange = endDateObj.diff(startDateObj, "days") + 1;

    // Generate data for each day
    for (let dayIndex = 0; dayIndex < daysInRange; dayIndex++) {
      const currentDate = startDateObj.add(dayIndex, "day");
      const dayData = [];
      
      // Generate hourly data (24 hours)
      for (let hour = 0; hour < 24; hour++) {
        // Create realistic patterns
        let state;
        if (hour >= 0 && hour < 6) {
          state = Math.random() > 0.7 ? 'REST' : 'NO_DATA';
        } else if (hour >= 6 && hour < 8) {
          state = Math.random() > 0.5 ? 'AVAILABLE' : 'WORK';
        } else if (hour >= 8 && hour < 12) {
          state = Math.random() > 0.3 ? 'DRIVING' : 'WORK';
        } else if (hour >= 12 && hour < 13) {
          state = 'REST';
        } else if (hour >= 13 && hour < 17) {
          state = Math.random() > 0.4 ? 'DRIVING' : 'WORK';
        } else if (hour >= 17 && hour < 19) {
          state = Math.random() > 0.6 ? 'WORK' : 'AVAILABLE';
        } else {
          state = Math.random() > 0.8 ? 'AVAILABLE' : 'REST';
        }

        // Randomly assign some data sources
        const dataSource = Math.random() > 0.7 ? 'DDD_OVERWRITE' : 'TACHO_SERVICE';
        
        dayData.push({
          hour,
          state,
          dataSource,
          value: 1, // Each hour block has value 1
        });
      }

      // Calculate daily totals
      const drivingHours = dayData.filter(d => d.state === 'DRIVING').length;
      const workHours = dayData.filter(d => d.state === 'WORK').length;
      const totalCommitment = drivingHours + workHours;
      
      timelineData.push({
        date: currentDate.format("YYYY-MM-DD"),
        dateObj: currentDate,
        dayOfWeek: currentDate.format("ddd"),
        commitment: `${Math.floor(totalCommitment)}h ${((totalCommitment % 1) * 60).toFixed(0).padStart(2, '0')}min.`,
        drivingTime: `${Math.floor(drivingHours)}h ${((drivingHours % 1) * 60).toFixed(0).padStart(2, '0')}min.`,
        dataSource: dayData.some(d => d.dataSource === 'DDD_OVERWRITE') ? 'ddd_overwrite' : 'tacho_service',
        lastDDDUpdate: dayData.some(d => d.dataSource === 'DDD_OVERWRITE') 
          ? dayjs().subtract(Math.floor(Math.random() * 24), 'hours').format("HH:mm")
          : null,
        hourlyData: dayData,
        isEmpty: false,
      });
    }

    return timelineData;
  };

  useEffect(() => {
    if (
      apiActivitiesData &&
      Array.isArray(apiActivitiesData) &&
      apiActivitiesData.length > 0
    ) {
      setActivitiesData(apiActivitiesData);
      setDrivers([
        { id: "1", name: "Youssef Hanaien (Autista)" },
        { id: "2", name: "Luigi Bianchi" },
        { id: "3", name: "Giovanni Verdi" },
      ]);
      setVehicles([
        { plate: "GX576AE", driverId: "1" },
        { plate: "EF456GH", driverId: "1" },
        { plate: "IJ789KL", driverId: "2" },
      ]);
      setLoading(false);
    } else {
      setLoading(true);
      setTimeout(() => {
        setDrivers([
          { id: "1", name: "Youssef Hanaien (Autista)" },
          { id: "2", name: "Luigi Bianchi" },
          { id: "3", name: "Giovanni Verdi" },
        ]);
        setVehicles([
          { plate: "GX576AE", driverId: "1" },
          { plate: "EF456GH", driverId: "1" },
          { plate: "IJ789KL", driverId: "2" },
        ]);
        setActivitiesData(generateTimelineData());
        setLoading(false);
      }, 500);
    }
  }, [apiActivitiesData, driverId, startDate, endDate, vehicleFilter]);

  const handleDateChange = (newDate, isStart = true) => {
    if (isStart) {
      if (newDate && endDate) {
        const diffInDays = endDate.diff(newDate, "days");
        if (diffInDays > 6) {
          setErrorDialog({
            open: true,
            message: "Maximum date range is 7 days",
          });
          return;
        }
        if (newDate.isAfter(dayjs())) {
          setErrorDialog({
            open: true,
            message: "Future dates are not allowed",
          });
          return;
        }
      }
      setStartDate(newDate);
    } else {
      if (newDate && startDate) {
        const diffInDays = newDate.diff(startDate, "days");
        if (diffInDays > 6) {
          setErrorDialog({
            open: true,
            message: "Maximum date range is 7 days",
          });
          return;
        }
        if (newDate.isAfter(dayjs())) {
          setErrorDialog({
            open: true,
            message: "Future dates are not allowed",
          });
          return;
        }
      }
      setEndDate(newDate);
    }
  };

  const handleReset = () => {
    setLoading(true);

    setTimeout(() => {
      setStartDate(dayjs().subtract(6, "days"));
      setEndDate(dayjs());
      if (!propDriverId) setDriverId(null);
      setVehicleFilter(null);
      setSuccessMessage("Reset to last 7 days");
      setLoading(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    }, 500);
  };

  const shouldDisableDate = (date) => date && date > dayjs().endOf("day");

  // Create heatmap-style chart data
  const createHeatmapData = () => {
    const heatmapSeries = [];
    
    activitiesData.forEach((dayData, dayIndex) => {
      if (dayData.hourlyData) {
        dayData.hourlyData.forEach((hourData) => {
          heatmapSeries.push({
            x: `${hourData.hour.toString().padStart(2, '0')}:00`,
            y: dayData.dayOfWeek,
            fillColor: DRIVER_STATES[hourData.state]?.color || '#d9d9d9',
            state: hourData.state,
            dataSource: hourData.dataSource,
            date: dayData.date,
            commitment: dayData.commitment,
          });
        });
      }
    });

    return [{
      name: 'Driver Activities',
      data: heatmapSeries
    }];
  };

  const chartOptions = {
    chart: {
      type: 'heatmap',
      height: 400,
      toolbar: { show: false },
      animations: { enabled: false },
    },
    plotOptions: {
      heatmap: {
        shadeIntensity: 0,
        radius: 2,
        useFillColorAsStroke: false,
        colorScale: {
          ranges: Object.keys(DRIVER_STATES).map(key => ({
            from: 0,
            to: 1,
            color: DRIVER_STATES[key].color,
            name: DRIVER_STATES[key].name,
          }))
        }
      }
    },
    xaxis: {
      type: 'category',
      categories: Array.from({length: 24}, (_, i) => `${i.toString().padStart(2, '0')}:00`),
      title: {
        text: 'Time',
        style: {
          fontSize: '14px',
          fontWeight: 600,
        }
      },
      labels: {
        style: {
          fontSize: '12px',
          fontWeight: 500,
        }
      }
    },
    yaxis: {
      title: {
        text: 'Day',
        style: {
          fontSize: '14px',
          fontWeight: 600,
        }
      },
      labels: {
        style: {
          fontSize: '12px',
          fontWeight: 600,
        }
      }
    },
    tooltip: {
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const dataPoint = w.config.series[seriesIndex].data[dataPointIndex];
        if (!dataPoint) return '';

        const stateName = DRIVER_STATES[dataPoint.state]?.name || 'Unknown';
        const dataSourceInfo = DATA_SOURCES[dataPoint.dataSource === 'DDD_OVERWRITE' ? 'DDD_OVERWRITE' : 'TACHO_SERVICE'];

        return `
          <div style="padding: 12px; background: white; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); min-width: 200px;">
            <div style="font-weight: 600; color: black; margin-bottom: 8px;">
              ${dataPoint.x} - ${dataPoint.y}
            </div>
            <div style="margin-bottom: 4px;">
              <strong>Activity:</strong> ${stateName}
            </div>
            <div style="margin-bottom: 4px;">
              <strong>Date:</strong> ${dataPoint.date}
            </div>
            <div style="font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 4px;">
              <div style="margin-bottom: 2px;">
                Data Source: <span style="color: ${dataSourceInfo.color}; font-weight: 600;">${dataSourceInfo.name}</span>
              </div>
            </div>
          </div>
        `;
      }
    },
    legend: {
      show: false
    },
    dataLabels: {
      enabled: false
    },
    grid: {
      padding: {
        right: 20
      }
    }
  };

  const getDataSourceIndicator = (dataSource) => {
    const sourceConfig = DATA_SOURCES[dataSource] || DATA_SOURCES.TACHO_SERVICE;
    return {
      borderLeft: sourceConfig.borderStyle,
      backgroundColor: sourceConfig.backgroundColor,
    };
  };

  const getDataSourceChip = (dataSource, lastDDDUpdate) => {
    if (dataSource === DATA_SOURCES.DDD_OVERWRITE.key) {
      return (
        <Tooltip
          title={`Real tachograph data from DDD file${
            lastDDDUpdate ? ` (Updated: ${lastDDDUpdate})` : ""
          }`}
          arrow
        >
          <Chip
            label="DDD Data"
            size="small"
            icon={<Info sx={{ fontSize: "14px !important" }} />}
            sx={{
              backgroundColor: "#4caf50",
              color: "white",
              fontSize: "0.7rem",
              height: "22px",
              "& .MuiChip-icon": {
                color: "white",
              },
            }}
          />
        </Tooltip>
      );
    }
    return null;
  };

  // Calculate statistics for DDD overwrites
  const dddOverwriteCount = activitiesData.filter(
    (day) => day.dataSource === DATA_SOURCES.DDD_OVERWRITE.key
  ).length;
  const totalDays = activitiesData.length;
  const dddPercentage =
    totalDays > 0 ? ((dddOverwriteCount / totalDays) * 100).toFixed(1) : 0;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card sx={{ margin: 0 }}>
        <CardContent>
          {/* Header */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mt: 1, mb: 3 }}
          >
            <Box display="flex" alignItems="center">
              {fromVehicleView && (
                <Button
                  startIcon={<ArrowBack />}
                  onClick={() => window.history.back()}
                  sx={{ mr: 2 }}
                />
              )}
              <Typography variant="h5" component="h1">
                Grafico Autista
              </Typography>
            </Box>
            <Box>
              <Button
                startIcon={<Refresh />}
                onClick={handleReset}
                variant="contained"
              >
                Reset to Last 7 Days
              </Button>
            </Box>
          </Box>

          {/* Filters */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {!propDriverId && (
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Autista</InputLabel>
                  <Select
                    value={driverId || ""}
                    onChange={(e) => setDriverId(e.target.value || null)}
                    label="Autista"
                  >
                    <MenuItem value="">Clear Selection</MenuItem>
                    {drivers.map((driver) => (
                      <MenuItem key={driver.id} value={driver.id}>
                        {driver.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Periodo"
                value={startDate}
                onChange={(newValue) => handleDateChange(newValue, true)}
                shouldDisableDate={shouldDisableDate}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => handleDateChange(newValue, false)}
                shouldDisableDate={shouldDisableDate}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" sx={{ mt: 2 }}>
                Veicolo attuale: <strong>GX576AE</strong>
              </Typography>
            </Grid>
          </Grid>

          {/* Driver and Date Info */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6">
              Autista: {driverId
                ? drivers.find((d) => d.id === driverId)?.name || "Youssef Hanaien (Autista)"
                : "Youssef Hanaien (Autista)"} 
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Periodo: {startDate?.format("DD.MM.YYYY") || "N/A"} - {endDate?.format("DD.MM.YYYY") || "N/A"}
            </Typography>
          </Box>

          {/* Chart and Commitment Data */}
          <Box
            display="flex"
            gap={3}
            sx={{
              overflowX: "auto",
              alignItems: "flex-start",
              overflowY: "hidden",
            }}
          >
            <Box sx={{ flex: 1, minWidth: 800 }}>
              <ReactApexChart
                options={chartOptions}
                series={createHeatmapData()}
                type="heatmap"
                height={400}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                minWidth: 120,
                mt: 3,
                fontSize: 14,
              }}
            >
              {activitiesData.map((day, idx) => (
                <Box
                  key={idx}
                  sx={{
                    height: `${400 / Math.max(activitiesData.length, 7)}px`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderBottom:
                      idx !== activitiesData.length - 1
                        ? "1px solid #f0f0f0"
                        : "none",
                    boxSizing: "border-box",
                    px: 1,
                    ...getDataSourceIndicator(day.dataSource),
                  }}
                >
                  <Typography variant="body2" fontWeight="bold" sx={{ textAlign: 'center' }}>
                    {day.commitment}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Legend */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Legend
            </Typography>

            {/* Activity States Legend */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {Object.entries(DRIVER_STATES).map(([key, config]) => (
                <Grid item key={key} xs={12} sm={6} md={4} lg={3}>
                  <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                    <Box
                      sx={{
                        backgroundColor: config.color,
                        width: 20,
                        height: 20,
                        mr: 1,
                        borderRadius: 1,
                      }}
                    />
                    <Typography variant="body2">{config.name}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            {/* Data Source Legend */}
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Data Source Indicators:
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                  <Box
                    sx={{
                      width: 24,
                      height: 20,
                      borderLeft: DATA_SOURCES.DDD_OVERWRITE.borderStyle,
                      backgroundColor:
                        DATA_SOURCES.DDD_OVERWRITE.backgroundColor,
                      mr: 1,
                      borderRadius: "0 2px 2px 0",
                    }}
                  />
                  <Box>
                    <Typography variant="body2" fontWeight="600">
                      {DATA_SOURCES.DDD_OVERWRITE.name} (Real Tachograph Data)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {DATA_SOURCES.DDD_OVERWRITE.description}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                  <Box
                    sx={{
                      width: 24,
                      height: 20,
                      border: DATA_SOURCES.TACHO_SERVICE.borderStyle,
                      backgroundColor:
                        DATA_SOURCES.TACHO_SERVICE.backgroundColor,
                      mr: 1,
                      borderRadius: 2,
                    }}
                  />
                  <Box>
                    <Typography variant="body2" fontWeight="600">
                      {DATA_SOURCES.TACHO_SERVICE.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {DATA_SOURCES.TACHO_SERVICE.description}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Error Dialog */}
          <Dialog
            open={errorDialog.open}
            onClose={() => setErrorDialog({ open: false, message: "" })}
          >
            <DialogTitle>Invalid Selection</DialogTitle>
            <DialogContent>
              <Typography>{errorDialog.message}</Typography>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setErrorDialog({ open: false, message: "" })}
                color="primary"
              >
                OK
              </Button>
            </DialogActions>
          </Dialog>
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
};

export default DDDTab;