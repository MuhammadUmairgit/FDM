// src/pages/AnalyticsScreen/AnalyticsScreen.js
import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Chip,
  Avatar,
  Paper,
  IconButton,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
  Timeline,
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  CalendarToday,
  DateRange,
  Today,
  Person as PersonIcon,
  AttachMoney as AttachMoneyIcon,
  ShoppingCart as ShoppingCartIcon,
  ArrowBack,
  MonetizationOn,
} from "@mui/icons-material";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import CustomerSelect from "./CustomerSelect";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const AnalyticsScreen = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [timeRange, setTimeRange] = useState("month");
  const [chartType, setChartType] = useState("bar");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [productData, setProductData] = useState([]);
  const [timeData, setTimeData] = useState([]);
  const [profitData, setProfitData] = useState([]);

  // Fetch customer orders when customer is selected
  useEffect(() => {
    const fetchCustomerOrders = async () => {
      if (!selectedCustomer) return;

      setLoading(true);
      try {
        const ordersQuery = query(
          collection(db, "orders"),
          where("contactId", "==", selectedCustomer.id)
        );
        const querySnapshot = await getDocs(ordersQuery);

        const orders = [];
        querySnapshot.forEach((doc) => {
          orders.push({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date?.toDate() || new Date(),
          });
        });

        setCustomerOrders(orders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerOrders();
  }, [selectedCustomer]);

  // Process data for charts
  useEffect(() => {
    if (customerOrders.length === 0) {
      setProductData([]);
      setTimeData([]);
      setProfitData([]);
      return;
    }

    // Process product data for pie chart
    const productMap = {};
    const productProfitMap = {};

    customerOrders.forEach((order) => {
      order.items.forEach((item) => {
        // Quantity data
        if (productMap[item.name]) {
          productMap[item.name] += item.quantity;
        } else {
          productMap[item.name] = item.quantity;
        }

        // Profit data
        if (item.sellingPrice && item.price) {
          const profit = (item.sellingPrice - item.price) * item.quantity;
          if (productProfitMap[item.name]) {
            productProfitMap[item.name] += profit;
          } else {
            productProfitMap[item.name] = profit;
          }
        }
      });
    });

    const productChartData = Object.entries(productMap)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    setProductData(productChartData);

    // Process profit data for profit chart
    const profitChartData = Object.entries(productProfitMap)
      .map(([name, value]) => ({
        name,
        value: parseFloat(value.toFixed(2)),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    setProfitData(profitChartData);

    // Process time data based on selected range
    const now = new Date();
    let timeChartData = [];

    if (timeRange === "day") {
      // Group by hour for today
      const hours = Array(24)
        .fill()
        .map((_, i) => ({
          hour: i,
          name: `${i}:00`,
          sales: 0,
          items: 0,
          profit: 0,
        }));

      customerOrders.forEach((order) => {
        const orderHour = order.date.getHours();
        hours[orderHour].sales += order.total;
        hours[orderHour].items += order.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        );

        // Calculate profit for this order
        const orderProfit = order.items.reduce((sum, item) => {
          if (item.sellingPrice && item.price) {
            return sum + (item.sellingPrice - item.price) * item.quantity;
          }
          return sum;
        }, 0);

        hours[orderHour].profit += orderProfit;
      });

      timeChartData = hours;
    } else if (timeRange === "week") {
      // Group by day for this week
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const weekData = days.map((day, i) => ({
        day: i,
        name: day,
        sales: 0,
        items: 0,
        profit: 0,
      }));

      customerOrders.forEach((order) => {
        const orderDay = order.date.getDay();
        weekData[orderDay].sales += order.total;
        weekData[orderDay].items += order.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        );

        // Calculate profit for this order
        const orderProfit = order.items.reduce((sum, item) => {
          if (item.sellingPrice && item.price) {
            return sum + (item.sellingPrice - item.price) * item.quantity;
          }
          return sum;
        }, 0);

        weekData[orderDay].profit += orderProfit;
      });

      timeChartData = weekData;
    } else {
      // Group by month for this year
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const monthData = months.map((month, i) => ({
        month: i,
        name: month,
        sales: 0,
        items: 0,
        profit: 0,
      }));

      customerOrders.forEach((order) => {
        const orderMonth = order.date.getMonth();
        monthData[orderMonth].sales += order.total;
        monthData[orderMonth].items += order.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        );

        // Calculate profit for this order
        const orderProfit = order.items.reduce((sum, item) => {
          if (item.sellingPrice && item.price) {
            return sum + (item.sellingPrice - item.price) * item.quantity;
          }
          return sum;
        }, 0);

        monthData[orderMonth].profit += orderProfit;
      });

      timeChartData = monthData;
    }

    setTimeData(timeChartData);
  }, [customerOrders, timeRange]);

  const renderChart = () => {
    if (loading) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height={300}
        >
          <CircularProgress />
        </Box>
      );
    }

    if (!selectedCustomer) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height={300}
          flexDirection="column"
          textAlign="center"
          p={3}
        >
          <PersonIcon sx={{ fontSize: 60, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Select a customer to view analytics
          </Typography>
        </Box>
      );
    }

    if (customerOrders.length === 0) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height={300}
          flexDirection="column"
          textAlign="center"
          p={3}
        >
          <ShoppingCartIcon
            sx={{ fontSize: 60, color: "text.disabled", mb: 2 }}
          />
          <Typography variant="h6" color="text.secondary">
            No orders found for this customer
          </Typography>
        </Box>
      );
    }

    switch (chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={timeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "sales") return [` ${value}`, "Total Sales"];
                  if (name === "profit") return [` ${value}`, "Profit"];
                  return [value, "Items Purchased"];
                }}
              />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="sales"
                fill="#8884d8"
                name="Total Sales"
              />
              <Bar
                yAxisId="left"
                dataKey="profit"
                fill="#FFBB28"
                name="Profit"
              />
              <Bar
                yAxisId="right"
                dataKey="items"
                fill="#82ca9d"
                name="Items Purchased"
              />
            </BarChart>
          </ResponsiveContainer>
        );
      case "line":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={timeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "sales") return [` ${value}`, "Total Sales"];
                  if (name === "profit") return [` ${value}`, "Profit"];
                  return [value, "Items Purchased"];
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="sales"
                stroke="#8884d8"
                name="Total Sales"
                strokeWidth={2}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="profit"
                stroke="#FFBB28"
                name="Profit"
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="items"
                stroke="#82ca9d"
                name="Items Purchased"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  const totalSpent = useMemo(() => {
    return customerOrders.reduce((sum, order) => sum + order.total, 0);
  }, [customerOrders]);

  const totalItems = useMemo(() => {
    return customerOrders.reduce(
      (sum, order) =>
        sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );
  }, [customerOrders]);

  const totalProfit = useMemo(() => {
    return customerOrders.reduce((sum, order) => {
      const orderProfit = order.items.reduce((itemSum, item) => {
        if (item.sellingPrice && item.price) {
          return itemSum + (item.sellingPrice - item.price) * item.quantity;
        }
        return itemSum;
      }, 0);
      return sum + orderProfit;
    }, 0);
  }, [customerOrders]);

  const averageOrderValue = useMemo(() => {
    return customerOrders.length > 0 ? totalSpent / customerOrders.length : 0;
  }, [customerOrders, totalSpent]);

  const averageProfitPerOrder = useMemo(() => {
    return customerOrders.length > 0 ? totalProfit / customerOrders.length : 0;
  }, [customerOrders, totalProfit]);

  return (
    <Box sx={{ p: isMobile ? 1 : 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "center",
          mb: 3,
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {isMobile && selectedCustomer && (
            <IconButton onClick={() => setSelectedCustomer(null)}>
              <ArrowBack />
            </IconButton>
          )}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: theme.palette.primary.main,
              }}
            >
              Customer Analytics
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {selectedCustomer
                ? `Purchase history for ${selectedCustomer.name}`
                : "Select a customer to view analytics"}
            </Typography>
          </motion.div>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexDirection: isMobile ? "column" : "row",
            width: isMobile ? "100%" : "auto",
          }}
        >
          <CustomerSelect
            selectedContact={selectedCustomer}
            setSelectedContact={setSelectedCustomer}
            isMobile={isMobile}
            label="Select customer"
            clearable
          />

          {selectedCustomer && (
            <FormControl
              size={isMobile ? "small" : "medium"}
              sx={{ minWidth: isMobile ? "100%" : 150 }}
            >
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                label="Time Range"
              >
                <MenuItem value="day">
                  <Box display="flex" alignItems="center" gap={1}>
                    <Today fontSize="small" />
                    By Hour
                  </Box>
                </MenuItem>
                <MenuItem value="week">
                  <Box display="flex" alignItems="center" gap={1}>
                    <DateRange fontSize="small" />
                    By Day
                  </Box>
                </MenuItem>
                <MenuItem value="month">
                  <Box display="flex" alignItems="center" gap={1}>
                    <CalendarToday fontSize="small" />
                    By Month
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          )}
        </Box>
      </Box>

      {selectedCustomer && (
        <>
          {/* Customer Info Card */}
          <Card
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            sx={{
              mb: 3,
              borderRadius: 3,
              boxShadow: 3,
              bgcolor: "background.paper",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  flexDirection: isMobile ? "column" : "row",
                  textAlign: isMobile ? "center" : "left",
                }}
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: "primary.main",
                    fontSize: 32,
                  }}
                >
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {selectedCustomer.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedCustomer.email || "No email provided"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedCustomer.phone || "No phone provided"}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    flexDirection: isMobile ? "row" : "column",
                    alignItems: isMobile ? "center" : "flex-end",
                  }}
                >
                  <Chip
                    label={`${customerOrders.length} orders`}
                    color="primary"
                    variant="outlined"
                    icon={<ShoppingCartIcon />}
                  />
                  <Chip
                    label={` ${totalSpent.toFixed(2)} spent`}
                    color="success"
                    variant="outlined"
                    icon={<AttachMoneyIcon />}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Chart Type Tabs */}
          <Box sx={{ mb: 3 }}>
            <Tabs
              value={chartType}
              onChange={(_, newValue) => setChartType(newValue)}
              variant={isMobile ? "scrollable" : "standard"}
              scrollButtons="auto"
              allowScrollButtonsMobile
            >
              <Tab
                label="Bar Chart"
                value="bar"
                icon={<BarChartIcon />}
                iconPosition="start"
              />
              <Tab
                label="Line Chart"
                value="line"
                icon={<TrendingUp />}
                iconPosition="start"
              />
            </Tabs>
          </Box>

          {/* Main Chart */}
          <Card
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            sx={{
              mb: 3,
              borderRadius: 3,
              boxShadow: 3,
              overflow: "hidden",
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Purchase History
              </Typography>
              {renderChart()}
            </CardContent>
          </Card>

          {/* Metrics Tabs */}
          <Box sx={{ mb: 2 }}>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              variant={isMobile ? "scrollable" : "standard"}
              scrollButtons="auto"
              allowScrollButtonsMobile
            >
              <Tab
                label="Product Breakdown"
                icon={<PieChartIcon />}
                iconPosition="start"
              />
              <Tab
                label="Profit Analysis"
                icon={<MonetizationOn />}
                iconPosition="start"
              />
              <Tab
                label="Purchase Summary"
                icon={<PersonIcon />}
                iconPosition="start"
              />
            </Tabs>
          </Box>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{
                opacity: 0,
                x: activeTab === 0 ? -50 : activeTab === 1 ? 50 : 0,
              }}
              animate={{ opacity: 1, x: 0 }}
              exit={{
                opacity: 0,
                x: activeTab === 0 ? -50 : activeTab === 1 ? 50 : 0,
              }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 0 ? (
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: 3,
                    mb: 3,
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontWeight: 600 }}
                    >
                      Top Purchased Products
                    </Typography>
                    {productData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={productData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) =>
                              `${name}: ${(percent * 100).toFixed(0)}%`
                            }
                          >
                            {productData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [
                              `${value} items`,
                              "Quantity",
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        height={200}
                        flexDirection="column"
                      >
                        <ShoppingCartIcon
                          sx={{ fontSize: 60, color: "text.disabled", mb: 2 }}
                        />
                        <Typography color="text.secondary">
                          No product data available
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ) : activeTab === 1 ? (
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: 3,
                    mb: 3,
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontWeight: 600 }}
                    >
                      Profit by Product
                    </Typography>
                    {profitData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={profitData}
                          layout="vertical"
                          margin={{ left: 30 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={100} />
                          <Tooltip
                            formatter={(value) => [` ${value}`, "Profit"]}
                          />
                          <Legend />
                          <Bar
                            dataKey="value"
                            fill="#FFBB28"
                            name="Profit"
                            barSize={20}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        height={200}
                        flexDirection="column"
                      >
                        <MonetizationOn
                          sx={{ fontSize: 60, color: "text.disabled", mb: 2 }}
                        />
                        <Typography color="text.secondary">
                          No profit data available
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
                    gap: 3,
                    mb: 3,
                  }}
                >
                  {[
                    {
                      title: "Total Spent",
                      value: ` ${totalSpent.toFixed(2)}`,
                      icon: <AttachMoneyIcon fontSize="large" />,
                      color: "primary.main",
                    },
                    {
                      title: "Total Profit",
                      value: ` ${totalProfit.toFixed(2)}`,
                      icon: <MonetizationOn fontSize="large" />,
                      color: "warning.main",
                    },
                    {
                      title: "Total Items",
                      value: totalItems,
                      icon: <ShoppingCartIcon fontSize="large" />,
                      color: "secondary.main",
                    },
                    {
                      title: "Avg. Order Value",
                      value: ` ${averageOrderValue.toFixed(2)}`,
                      icon: <Timeline fontSize="large" />,
                      color: "success.main",
                    },
                    {
                      title: "Avg. Profit/Order",
                      value: ` ${averageProfitPerOrder.toFixed(2)}`,
                      icon: <TrendingUp fontSize="large" />,
                      color: "info.main",
                    },
                  ].map((metric, index) => (
                    <motion.div
                      key={metric.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card
                        sx={{
                          borderRadius: 3,
                          boxShadow: 3,
                          bgcolor: "background.paper",
                        }}
                      >
                        <CardContent>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Box>
                              <Typography
                                variant="subtitle1"
                                color="text.secondary"
                                gutterBottom
                              >
                                {metric.title}
                              </Typography>
                              <Typography
                                variant="h4"
                                sx={{
                                  fontWeight: 700,
                                  color: metric.color,
                                }}
                              >
                                {metric.value}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                bgcolor: `${metric.color}20`,
                                p: 2,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {metric.icon}
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </Box>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Recent Orders */}
          <Card
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            sx={{
              borderRadius: 3,
              boxShadow: 3,
              mb: 3,
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Recent Orders
              </Typography>
              {customerOrders.length > 0 ? (
                <Box
                  sx={{
                    maxHeight: 400,
                    overflow: "auto",
                    pr: 1,
                  }}
                >
                  {customerOrders.slice(0, 5).map((order) => {
                    // Calculate profit for this order
                    const orderProfit = order.items.reduce((sum, item) => {
                      if (item.sellingPrice && item.price) {
                        return (
                          sum + (item.sellingPrice - item.price) * item.quantity
                        );
                      }
                      return sum;
                    }, 0);

                    return (
                      <Paper
                        key={order.id}
                        elevation={1}
                        sx={{
                          p: 2,
                          mb: 2,
                          borderRadius: 2,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1,
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600 }}
                          >
                            Order #{order.id.slice(0, 8)}
                          </Typography>
                          <Box display="flex" gap={1}>
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 700,
                                color: "success.dark",
                              }}
                            >
                              {order.total.toFixed(2)}
                            </Typography>
                            {orderProfit > 0 && (
                              <Typography
                                variant="subtitle1"
                                sx={{
                                  fontWeight: 700,
                                  color: "warning.dark",
                                }}
                              >
                                (Profit: {orderProfit.toFixed(2)})
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {order.date.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 1,
                            mt: 1,
                          }}
                        >
                          {order.items.slice(0, 3).map((item, idx) => (
                            <Chip
                              key={idx}
                              label={`${item.name} (${item.quantity})`}
                              size="small"
                            />
                          ))}
                          {order.items.length > 3 && (
                            <Chip
                              label={`+${order.items.length - 3} more`}
                              size="small"
                            />
                          )}
                        </Box>
                      </Paper>
                    );
                  })}
                </Box>
              ) : (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height={100}
                  flexDirection="column"
                >
                  <ShoppingCartIcon
                    sx={{ fontSize: 60, color: "text.disabled", mb: 2 }}
                  />
                  <Typography color="text.secondary">
                    No recent orders found
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};

export default AnalyticsScreen;
