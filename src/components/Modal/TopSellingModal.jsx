import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Typography,
} from "@mui/material";

export const TopSellingModal = ({
  open,
  onClose,
  lowStockItems,
  lowStockProducts,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Low Stock Items ({lowStockItems})</DialogTitle>
      <DialogContent dividers>
        {lowStockProducts?.length > 0 ? (
          <List>
            {lowStockProducts.map((item, index) => (
              <React.Fragment key={item.id}>
                <ListItem>
                  <ListItemText
                    primary={item.name}
                    secondary={`Quantity: ${item.quantity} (Safety Stock: ${item.safetyStock})`}
                  />
                </ListItem>
                {index < lowStockProducts.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Typography>No low stock items</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

// Similar structure for OutOfStockModal, TopSellingModal, and NotificationsModal
