import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Chip,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Close as CloseIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";

const DashboardHeader = ({
  setShowNotificationsModal,
  lowStockCount,
  outOfStockCount,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [filter, setFilter] = React.useState("all");

  const handleFilterClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = (selectedFilter) => {
    setAnchorEl(null);
    if (selectedFilter) {
      setFilter(selectedFilter);
    }
  };

  const totalNotifications = lowStockCount + outOfStockCount;

  return (
    <AppBar position="static" color="default" elevation={0}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Dashboard
        </Typography>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {filter !== "all" && (
            <Chip
              label={
                filter === "low"
                  ? `Low Stock (${lowStockCount})`
                  : `Out of Stock (${outOfStockCount})`
              }
              onDelete={() => setFilter("all")}
              deleteIcon={<CloseIcon />}
              color={filter === "low" ? "warning" : "error"}
              size="small"
            />
          )}

          <IconButton
            color="inherit"
            onClick={handleFilterClick}
            aria-label="filter notifications"
            aria-controls="filter-menu"
            aria-haspopup="true"
          >
            <FilterIcon />
          </IconButton>

          <IconButton
            color="inherit"
            onClick={() => setShowNotificationsModal(true)}
            aria-label={`show ${totalNotifications} notifications`}
          >
            <Badge badgeContent={totalNotifications} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </div>

        <Menu
          id="filter-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={() => handleFilterClose(null)}
        >
          <MenuItem
            onClick={() => handleFilterClose("all")}
            selected={filter === "all"}
          >
            All Notifications ({totalNotifications})
          </MenuItem>
          <MenuItem
            onClick={() => handleFilterClose("low")}
            selected={filter === "low"}
          >
            Low Stock ({lowStockCount})
          </MenuItem>
          <MenuItem
            onClick={() => handleFilterClose("out")}
            selected={filter === "out"}
          >
            Out of Stock ({outOfStockCount})
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default DashboardHeader;
