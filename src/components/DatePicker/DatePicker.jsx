import React from "react";
import {
  Box,
  Typography,
  Button,
  Divider,
  IconButton,
  Menu,
} from "@mui/material";
import {
  ChevronRight,
  Today as TodayIcon,
  CalendarViewMonth as MonthIcon,
  DateRange as DateRangeIcon,
} from "@mui/icons-material";

// ✅ Corrected imports
import subMonths from "date-fns/subMonths";
import startOfMonth from "date-fns/startOfMonth";
import endOfMonth from "date-fns/endOfMonth";

import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const DatePicker = ({ open, onClose, onFilterClick, customDateRange }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [dateRange, setDateRange] = React.useState([
    {
      startDate: customDateRange?.start
        ? new Date(customDateRange.start)
        : new Date(),
      endDate: customDateRange?.end
        ? new Date(customDateRange.end)
        : new Date(),
      key: "selection",
    },
  ]);

  const handleApply = () => {
    onFilterClick("custom", {
      start: dateRange[0].startDate,
      end: dateRange[0].endDate,
    });
    setAnchorEl(null);
    onClose();
  };

  const handleQuickFilter = (filter) => {
    const today = new Date();
    let start = null;
    let end = null;

    switch (filter) {
      case "today":
        start = today;
        end = today;
        break;
      case "week":
        const dayOfWeek = today.getDay();
        start = new Date(today);
        start.setDate(today.getDate() - dayOfWeek);
        end = new Date(today);
        end.setDate(start.getDate() + 6);
        break;
      case "month":
        start = startOfMonth(today);
        end = endOfMonth(today);
        break;
      case "lastMonth":
        const lastMonth = subMonths(today, 1);
        start = startOfMonth(lastMonth);
        end = endOfMonth(lastMonth);
        break;
      case "year":
        start = new Date(today.getFullYear(), 0, 1);
        end = new Date(today.getFullYear(), 11, 31);
        break;
      default:
        onFilterClick("all");
        onClose();
        return;
    }

    onFilterClick("custom", { start, end });
    setAnchorEl(null);
    onClose();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          maxWidth: "100%",
          pl: 2,
        },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">Select Date Range</Typography>
        <IconButton onClick={onClose} size="small">
          <ChevronRight />
        </IconButton>
      </Box>

      <DateRangePicker
        onChange={(item) => setDateRange([item.selection])}
        showSelectionPreview={true}
        moveRangeOnFirstSelection={false}
        months={1}
        ranges={dateRange}
        direction="vertical"
        scroll={{ enabled: false }}
      />

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" gutterBottom>
        Quick Filters
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<TodayIcon />}
          onClick={() => handleQuickFilter("today")}
        >
          Today
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<DateRangeIcon />}
          onClick={() => handleQuickFilter("week")}
        >
          This Week
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<MonthIcon />}
          onClick={() => handleQuickFilter("month")}
        >
          This Month
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<MonthIcon />}
          onClick={() => handleQuickFilter("lastMonth")}
        >
          Last Month
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleQuickFilter("year")}
        >
          This Year
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleQuickFilter("all")}
        >
          All Time
        </Button>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleApply}>
          Apply
        </Button>
      </Box>
    </Menu>
  );
};

export default DatePicker;
