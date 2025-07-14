import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  Badge,
  Tabs,
  Tab,
  Chip,
  ListItemIcon,
  useTheme,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  TextField,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  Search as SearchIcon,
} from "@mui/icons-material";

const NotificationsModal = ({
  open,
  onClose,
  monthlyTopItems = [],
  lowStockItems = [],
  outOfStockItems = [],
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [anchorEl, setAnchorEl] = useState(null);
  const filterMenuOpen = Boolean(anchorEl);

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: { xs: "95%", sm: "85%", md: "70%", lg: "60%" },
    maxHeight: "80vh",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: { xs: 2, sm: 3, md: 4 },
    overflowY: "auto",
    borderRadius: 2,
  };

  const handleFilterClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    handleFilterClose();
  };

  const handleClearFilters = () => {
    setFilter("all");
    setSearchTerm("");
    setSortBy("default");
  };

  const filteredLowStock =
    filter === "all" || filter === "low"
      ? lowStockItems.filter((item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : [];
  const filteredOutOfStock =
    filter === "all" || filter === "out"
      ? outOfStockItems.filter((item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : [];

  // Sort items based on selected criteria
  const sortedMonthlyTopItems = [...monthlyTopItems].sort((a, b) => {
    if (sortBy === "quantity") return b.quantity - a.quantity;
    if (sortBy === "revenue") return b.totalSales - a.totalSales;
    if (sortBy === "profit") return (b.profit || 0) - (a.profit || 0);
    return 0; // default order
  });

  const sortedLowStockItems = [...filteredLowStock].sort((a, b) => {
    if (sortBy === "quantity") return a.quantity - b.quantity;
    if (sortBy === "price") return b.price - a.price;
    if (sortBy === "urgency") {
      const aUrgency = a.quantity / (a.safetyStock || 10);
      const bUrgency = b.quantity / (b.safetyStock || 10);
      return aUrgency - bUrgency;
    }
    return 0; // default order
  });

  const sortedOutOfStockItems = [...filteredOutOfStock].sort((a, b) => {
    if (sortBy === "price") return b.price - a.price;
    if (sortBy === "lastSold") {
      if (!a.lastSoldAt && !b.lastSoldAt) return 0;
      if (!a.lastSoldAt) return 1;
      if (!b.lastSoldAt) return -1;
      return b.lastSoldAt.toDate() - a.lastSoldAt.toDate();
    }
    return 0; // default order
  });

  const totalNotifications =
    monthlyTopItems.length + lowStockItems.length + outOfStockItems.length;

  const hasActiveFilters = filter !== "all" || searchTerm || sortBy !== "default";

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Box display="flex" alignItems="center" mb={2}>
          <Badge
            badgeContent={totalNotifications}
            color="primary"
            sx={{ mr: 2 }}
          >
            <NotificationsIcon color="primary" fontSize="large" />
          </Badge>
          <Typography variant="h5" component="div">
            Inventory Notifications
          </Typography>
        </Box>

        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ mb: 3 }}
          variant="fullWidth"
        >
          <Tab
            label={
              <Box display="flex" alignItems="center">
                <TrendingUpIcon sx={{ mr: 1 }} />
                Top Sellers ({monthlyTopItems.length})
              </Box>
            }
          />
          <Tab
            label={
              <Box display="flex" alignItems="center">
                <WarningIcon sx={{ mr: 1 }} />
                Stock Alerts ({lowStockItems.length + outOfStockItems.length})
              </Box>
            }
          />
        </Tabs>

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
          gap={2}
          flexWrap="wrap"
        >
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search items..."
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              endAdornment: searchTerm && (
                <CloseIcon
                  color="action"
                  onClick={() => setSearchTerm("")}
                  sx={{ cursor: "pointer" }}
                />
              ),
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1, maxWidth: 400 }}
          />

          <Box display="flex" gap={1}>
            <Chip
              icon={<FilterIcon />}
              label={
                filter === "all"
                  ? "All Alerts"
                  : filter === "low"
                  ? "Low Stock"
                  : "Out of Stock"
              }
              onClick={handleFilterClick}
              onDelete={filter !== "all" ? () => setFilter("all") : undefined}
              sx={{ cursor: "pointer" }}
            />

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort By"
              >
                <MenuItem value="default">Default</MenuItem>
                {activeTab === 0 ? (
                  [
                    <MenuItem key="quantity" value="quantity">
                      Quantity Sold
                    </MenuItem>,
                    <MenuItem key="revenue" value="revenue">
                      Total Revenue
                    </MenuItem>,
                    <MenuItem key="profit" value="profit">
                      Profit
                    </MenuItem>,
                  ]
                ) : (
                  [
                    <MenuItem key="quantity" value="quantity">
                      Stock Level
                    </MenuItem>,
                    <MenuItem key="price" value="price">
                      Price
                    </MenuItem>,
                    <MenuItem key="urgency" value="urgency">
                      Urgency
                    </MenuItem>,
                    <MenuItem key="lastSold" value="lastSold">
                      Last Sold
                    </MenuItem>,
                  ]
                )}
              </Select>
            </FormControl>

            {hasActiveFilters && (
              <Button
                size="small"
                onClick={handleClearFilters}
                startIcon={<CloseIcon fontSize="small" />}
              >
                Clear
              </Button>
            )}
          </Box>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={filterMenuOpen}
          onClose={handleFilterClose}
        >
          <MenuItem
            onClick={() => handleFilterChange("all")}
            selected={filter === "all"}
          >
            All Alerts
          </MenuItem>
          <MenuItem
            onClick={() => handleFilterChange("low")}
            selected={filter === "low"}
          >
            Low Stock Only
          </MenuItem>
          <MenuItem
            onClick={() => handleFilterChange("out")}
            selected={filter === "out"}
          >
            Out of Stock Only
          </MenuItem>
        </Menu>

        {activeTab === 0 ? (
          <>
            <Typography variant="body1" paragraph sx={{ mb: 2 }}>
              These items were your top performers last month. Consider
              maintaining good stock levels.
            </Typography>

            <Paper elevation={2} sx={{ mb: 3 }}>
              <List>
                {sortedMonthlyTopItems.length > 0 ? (
                  sortedMonthlyTopItems.map((item, index) => (
                    <React.Fragment key={`top-${index}`}>
                      <ListItem>
                        <ListItemText
                          primary={`${index + 1}. ${item.name}`}
                          secondary={
                            <>
                              <Typography
                                component="span"
                                variant="body2"
                                display="block"
                              >
                                Quantity Sold: {item.quantity}
                              </Typography>
                              <Typography
                                component="span"
                                variant="body2"
                                display="block"
                              >
                                Total Revenue: ${item.totalSales.toFixed(2)}
                              </Typography>
                              {item.profit && (
                                <Typography
                                  component="span"
                                  variant="body2"
                                  display="block"
                                >
                                  Profit: ${item.profit.toFixed(2)}
                                </Typography>
                              )}
                            </>
                          }
                        />
                      </ListItem>
                      {index < sortedMonthlyTopItems.length - 1 && <Divider />}
                    </React.Fragment>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No top selling items to display" />
                  </ListItem>
                )}
              </List>
            </Paper>
          </>
        ) : (
          <>
            <Typography variant="body1" paragraph sx={{ mb: 2 }}>
              Items needing your attention based on current stock levels
            </Typography>

            <Paper elevation={2}>
              <List>
                {sortedLowStockItems.length === 0 &&
                sortedOutOfStockItems.length === 0 ? (
                  <ListItem>
                    <ListItemText
                      primary={`No ${
                        filter === "all" ? "" : filter === "low" ? "low stock" : "out of stock"
                      } items found matching your criteria`}
                    />
                  </ListItem>
                ) : (
                  <>
                    {sortedLowStockItems.length > 0 && (
                      <>
                        <Typography variant="subtitle1" sx={{ px: 2, pt: 2 }}>
                          Low Stock Items ({sortedLowStockItems.length})
                        </Typography>
                        {sortedLowStockItems.map((item, index) => (
                          <React.Fragment key={`low-${index}`}>
                            <ListItem>
                              <ListItemIcon>
                                <WarningIcon color="warning" />
                              </ListItemIcon>
                              <ListItemText
                                primary={item.name}
                                secondary={
                                  <>
                                    <Typography
                                      component="span"
                                      variant="body2"
                                      display="block"
                                    >
                                      Current Stock: {item.quantity} (Safety:{" "}
                                      {item.safetyStock || 10})
                                    </Typography>
                                    <Typography
                                      component="span"
                                      variant="body2"
                                      display="block"
                                    >
                                      Price: ${item.price} | Cost: $
                                      {item.costPrice}
                                    </Typography>
                                    {item.lastSoldAt && (
                                      <Typography
                                        component="span"
                                        variant="body2"
                                        display="block"
                                      >
                                        Last Sold:{" "}
                                        {new Date(
                                          item.lastSoldAt.toDate()
                                        ).toLocaleDateString()}
                                      </Typography>
                                    )}
                                  </>
                                }
                              />
                            </ListItem>
                            {index < sortedLowStockItems.length - 1 && <Divider />}
                          </React.Fragment>
                        ))}
                      </>
                    )}

                    {sortedOutOfStockItems.length > 0 && (
                      <>
                        <Typography variant="subtitle1" sx={{ px: 2, pt: 2 }}>
                          Out of Stock Items ({sortedOutOfStockItems.length})
                        </Typography>
                        {sortedOutOfStockItems.map((item, index) => (
                          <React.Fragment key={`out-${index}`}>
                            <ListItem>
                              <ListItemIcon>
                                <ErrorIcon color="error" />
                              </ListItemIcon>
                              <ListItemText
                                primary={item.name}
                                secondary={
                                  <>
                                    <Typography
                                      component="span"
                                      variant="body2"
                                      display="block"
                                    >
                                      Price: ${item.price} | Cost: $
                                      {item.costPrice}
                                    </Typography>
                                    {item.lastSoldAt && (
                                      <Typography
                                        component="span"
                                        variant="body2"
                                        display="block"
                                      >
                                        Last Sold:{" "}
                                        {new Date(
                                          item.lastSoldAt.toDate()
                                        ).toLocaleDateString()}
                                      </Typography>
                                    )}
                                  </>
                                }
                              />
                            </ListItem>
                            {index < sortedOutOfStockItems.length - 1 && (
                              <Divider />
                            )}
                          </React.Fragment>
                        ))}
                      </>
                    )}
                  </>
                )}
              </List>
            </Paper>
          </>
        )}

        <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
          <Button
            onClick={onClose}
            variant="contained"
            color="primary"
            sx={{ px: 4 }}
          >
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default NotificationsModal;