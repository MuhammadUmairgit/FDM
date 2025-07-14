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
import { Error as ErrorIcon } from '@mui/icons-material';

const OutOfStockModal = ({
  open,
  onClose,
  outOfStockItems,
  outOfStockProducts,
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
        <Box display="flex" alignItems="center" mb={2}>
          <Badge badgeContent={outOfStockItems} color="error" sx={{ mr: 2 }}>
            <ErrorIcon color="error" fontSize="large" />
          </Badge>
          <Typography variant="h5">Out of Stock Items</Typography>
        </Box>

        <Typography variant="body1" paragraph>
          These items are currently out of stock and need to be reordered.
        </Typography>

        <Paper elevation={2}>
          <List>
            {outOfStockProducts.map((item, index) => (
              <React.Fragment key={item.id}>
                <ListItem>
                  <ListItemText
                    primary={item.name}
                    secondary={
                      <Typography component="span" variant="body2" display="block">
                        Last known stock: {item.quantity}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < outOfStockProducts.length - 1 && <Divider />}
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

export default OutOfStockModal;