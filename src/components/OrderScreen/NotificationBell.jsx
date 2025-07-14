import React, { useState } from "react";
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
  Avatar
} from "@mui/material";
import { 
  Notifications as NotificationsIcon,
  Check as CheckIcon,
  ShoppingCart as ShoppingCartIcon,
  Alarm as AlarmIcon
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';

const NotificationBell = ({ 
  count, 
  notifications = [], 
  onClearNotifications 
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(notifications.filter(n => !n.read));

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    // Mark all as read when opened
    setUnreadNotifications([]);
    if (notifications.length > 0) {
      onClearNotifications();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'order':
        return <ShoppingCartIcon color="primary" />;
      case 'reminder':
        return <AlarmIcon color="warning" />;
      default:
        return <NotificationsIcon color="action" />;
    }
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
          <Badge badgeContent={count} color="error">
            <NotificationsIcon />
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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
          {notifications.length > 0 && (
            <Button 
              size="small" 
              onClick={() => {
                onClearNotifications();
                handleClose();
              }}
              startIcon={<CheckIcon />}
            >
              Mark all as read
            </Button>
          )}
        </Box>

        {notifications.length === 0 ? (
          <Box textAlign="center" py={2}>
            <Typography variant="body2" color="text.secondary">
              No new notifications
            </Typography>
          </Box>
        ) : (
          <List sx={{ maxHeight: 300, overflow: 'auto' }}>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem sx={{ py: 1 }}>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'background.default' }}>
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={notification.message}
                    secondary={formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Popover>
    </>
  );
};

export default NotificationBell;