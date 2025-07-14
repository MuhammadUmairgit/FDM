import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
} from "@mui/material";
import {
  ShoppingCart as ShoppingCartIcon,
  History as HistoryIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";

const MobileMenuDrawer = ({
  open,
  onClose,
  activeTab,
  onTabChange,
  pastOrdersCount,
}) => {
  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 250,
          p: 2,
        },
      }}
    >
      <List>
        <ListItem
          button
          onClick={() => {
            onTabChange(null, 0);
            onClose();
          }}
          selected={activeTab === 0}
          sx={{
            borderRadius: 2,
            mb: 1,
          }}
        >
          <ListItemIcon>
            <ShoppingCartIcon
              color={activeTab === 0 ? "primary" : "inherit"}
            />
          </ListItemIcon>
          <ListItemText primary="New Order" />
        </ListItem>

        <ListItem
          button
          onClick={() => {
            onTabChange(null, 1);
            onClose();
          }}
          selected={activeTab === 1}
          sx={{
            borderRadius: 2,
          }}
        >
          <ListItemIcon>
            <Badge badgeContent={pastOrdersCount} color="primary">
              <HistoryIcon
                color={activeTab === 1 ? "primary" : "inherit"}
              />
            </Badge>
          </ListItemIcon>
          <ListItemText primary="Order History" />
        </ListItem>
      </List>

      <Divider sx={{ my: 2 }} />

      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{ width: "100%" }}
      >
        <ListItem
          button
          onClick={onClose}
          sx={{
            borderRadius: 2,
            color: "error.main",
          }}
        >
          <ListItemIcon sx={{ color: "error.main" }}>
            <CloseIcon />
          </ListItemIcon>
          <ListItemText primary="Close Menu" />
        </ListItem>
      </motion.div>
    </Drawer>
  );
};

export default MobileMenuDrawer;