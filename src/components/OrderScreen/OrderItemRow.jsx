import React, { useState, useEffect } from "react";
import {
  Badge,
  IconButton,
  Popover,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Divider,
  Avatar,
} from "@mui/material";
import {
  ShoppingCart as ShoppingCartIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

const CartNotification = ({ onClearCart, onItemRemove }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("cartItems") || "[]");
    setCartItems(items);
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const handleRemoveItem = (index) => {
    const newItems = [...cartItems];
    newItems.splice(index, 1);
    setCartItems(newItems);
    localStorage.setItem("cartItems", JSON.stringify(newItems));
    if (onItemRemove) onItemRemove(index);
  };

  const handleClearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cartItems");
    if (onClearCart) onClearCart();
    handleClose();
  };

  return (
    <>
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <IconButton
          color="inherit"
          onClick={handleClick}
          sx={{
            position: "relative",
          }}
        >
          <Badge badgeContent={cartItems.length} color="error">
            <ShoppingCartIcon />
          </Badge>
        </IconButton>
      </motion.div>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            p: 2,
            width: 350,
            maxHeight: 400,
            borderRadius: 3,
            boxShadow: 3,
          },
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Saved Cart Items
          </Typography>
          {cartItems.length > 0 && (
            <Button
              size="small"
              onClick={handleClearCart}
              startIcon={<CheckIcon />}
              color="error"
            >
              Clear Cart
            </Button>
          )}
        </Box>

        {cartItems.length === 0 ? (
          <Box textAlign="center" py={2}>
            <Typography variant="body2" color="text.secondary">
              No items in cart
            </Typography>
          </Box>
        ) : (
          <List sx={{ maxHeight: 300, overflow: "auto" }}>
            {cartItems.map((item, index) => (
              <React.Fragment key={`${item.id}-${index}`}>
                <ListItem sx={{ py: 1 }}>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: "background.default" }}>
                      <ShoppingCartIcon color="primary" />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={`${item.name} (${item.quantity})`}
                    secondary={` ${item.price} each`}
                  />
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleRemoveItem(index)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
                {index < cartItems.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Popover>
    </>
  );
};

export default CartNotification;
