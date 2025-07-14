import React from 'react';
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
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

const LowStockModal = ({ open, onClose, lowStockItems, lowStockProducts }) => {
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
        <Box display="flex" alignItems="center" mb={2}>
          <Badge badgeContent={lowStockItems} color="warning" sx={{ mr: 2 }}>
            <WarningIcon color="warning" fontSize="large" />
          </Badge>
          <Typography variant="h5">Low Stock Items</Typography>
        </Box>

        <Typography variant="body1" paragraph>
          These items are running low and may need to be reordered soon.
        </Typography>

        <Paper elevation={2}>
          <List>
            {lowStockProducts.map((item, index) => (
              <React.Fragment key={item.id}>
                <ListItem>
                  <ListItemText
                    primary={item.name}
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          display="block"
                        >
                          Current Stock: {item.quantity}
                        </Typography>
                        <Typography
                          component="span"
                          variant="body2"
                          display="block"
                        >
                          Safety Stock: {item.safetyStock}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < lowStockProducts.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose} variant="contained" color="primary">
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default LowStockModal;