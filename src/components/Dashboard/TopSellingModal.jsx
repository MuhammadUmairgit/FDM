import React from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  CircularProgress,
} from '@mui/material';

const dateRanges = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'This Week', value: 'this_week' },
  { label: 'Last Week', value: 'last_week' },
  { label: 'This Month', value: 'this_month' },
  { label: 'Last Month', value: 'last_month' },
  { label: 'This Year', value: 'this_year' },
];

const TopSellingModal = ({
  open,
  onClose,
  selectedRange,
  handleDateRangeChange,
  getRangeTitle,
  loading,
  topSellingItems,
}) => {
  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: '80%', md: '60%' },
    maxHeight: '80vh',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    overflowY: 'auto',
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h5" gutterBottom>
          Top Selling Items - {getRangeTitle(selectedRange)}
        </Typography>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Date Range</InputLabel>
          <Select
            value={selectedRange}
            label="Date Range"
            onChange={(e) => handleDateRangeChange(e.target.value)}
          >
            {dateRanges.map((range) => (
              <MenuItem key={range.value} value={range.value}>
                {range.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper elevation={2}>
            <List>
              {topSellingItems.map((item, index) => (
                <React.Fragment key={index}>
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
                            Sold: {item.quantity}
                          </Typography>
                          <Typography
                            component="span"
                            variant="body2"
                            display="block"
                          >
                            Revenue: ${item.totalSales.toFixed(2)}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {index < topSellingItems.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        )}

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose} variant="contained" color="primary">
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default TopSellingModal;