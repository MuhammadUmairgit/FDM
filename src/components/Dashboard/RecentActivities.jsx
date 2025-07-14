import React from 'react';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Paper,
} from '@mui/material';
import {
  ShoppingCart as OrderIcon,
  LocalShipping as DeliveryIcon,
  Inventory as StockIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';

const ActivityIcon = ({ type }) => {
  switch (type) {
    case 'order':
      return <OrderIcon color="primary" />;
    case 'delivery':
      return <DeliveryIcon color="secondary" />;
    case 'stock':
      return <StockIcon color="info" />;
    case 'payment':
      return <PaymentIcon color="success" />;
    default:
      return <OrderIcon color="primary" />;
  }
};

const RecentActivities = ({ recentActivities }) => {
  return (
    <>
      <Typography variant="h6" gutterBottom>
        Recent Activities
      </Typography>
      <Paper elevation={2}>
        <List>
          {recentActivities.map((activity, index) => (
            <React.Fragment key={activity.id}>
              <ListItem>
                <ListItemIcon>
                  <ActivityIcon type={activity.type} />
                </ListItemIcon>
                <ListItemText
                  primary={activity.title}
                  secondary={activity.time}
                />
              </ListItem>
              {index < recentActivities.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </>
  );
};

export default RecentActivities;