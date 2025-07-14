import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
} from "@mui/material";
import { format } from "date-fns/format";

const FilterDialog = ({
  open,
  onClose,
  dateFilter,
  onDateFilterChange,
  customDateRange,
  onCustomDateRangeChange,
  onApplyFilter,
}) => {
  // Add null checks for customDateRange
  const formattedStartDate = customDateRange?.start ? format(new Date(customDateRange.start), "yyyy-MM-dd") : "";
  const formattedEndDate = customDateRange?.end ? format(new Date(customDateRange.end), "yyyy-MM-dd") : "";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Filter Orders by Date Range</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Quick Filters
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              <Button
                variant={dateFilter === "current" ? "contained" : "outlined"}
                onClick={() => onDateFilterChange("current")}
              >
                Current Month
              </Button>
              <Button
                variant={dateFilter === "last" ? "contained" : "outlined"}
                onClick={() => onDateFilterChange("last")}
              >
                Last Month
              </Button>
              <Button
                variant={dateFilter === "custom" ? "contained" : "outlined"}
                onClick={() => onDateFilterChange("custom")}
              >
                Custom Range
              </Button>
            </Box>
          </Box>

          {dateFilter === "custom" && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Select Date Range
              </Typography>
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <TextField
                  label="Start Date"
                  type="date"
                  fullWidth
                  value={formattedStartDate}
                  onChange={(e) =>
                    onCustomDateRangeChange({
                      ...customDateRange,
                      start: new Date(e.target.value),
                    })
                  }
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="End Date"
                  type="date"
                  fullWidth
                  value={formattedEndDate}
                  onChange={(e) =>
                    onCustomDateRangeChange({
                      ...customDateRange,
                      end: new Date(e.target.value),
                    })
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error">
          Cancel
        </Button>
        <Button
          onClick={onApplyFilter}
          variant="contained"
          color="primary"
        >
          Apply Filter
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FilterDialog;