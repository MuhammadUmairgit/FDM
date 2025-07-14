// src/pages/ProfileScreen/components/MobileDrawer/MobileDrawer.js
import { AdminPanelSettings, Logout, Person } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  SwipeableDrawer,
  Typography,
} from "@mui/material";

const MobileDrawer = ({
  open,
  onClose,
  userData,
  isAdmin,
  activeTab,
  setActiveTab,
}) => {
  return (
    <SwipeableDrawer
      anchor="left"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      sx={{
        "& .MuiDrawer-paper": {
          width: "80%",
          maxWidth: 300,
          p: 2,
        },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Avatar
            src={userData?.photoURL}
            sx={{
              width: 80,
              height: 80,
              mx: "auto",
              mb: 2,
            }}
          />
          <Typography variant="h6">
            {userData?.displayName || userData?.email}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isAdmin ? "Administrator" : "User"}
          </Typography>
        </Box>

        <Divider sx={{ my: 1 }} />

        <List>
          <ListItem
            button
            onClick={() => {
              setActiveTab(0);
              onClose();
            }}
            selected={activeTab === 0}
          >
            <ListItemIcon>
              <Person />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItem>
          {isAdmin && (
            <ListItem
              button
              onClick={() => {
                setActiveTab(1);
                onClose();
              }}
              selected={activeTab === 1}
            >
              <ListItemIcon>
                <AdminPanelSettings />
              </ListItemIcon>
              <ListItemText primary="Admin Tools" />
            </ListItem>
          )}
        </List>

        <Box sx={{ flexGrow: 1 }} />

        <List>
          <ListItem button>
            <ListItemIcon>
              <Logout color="error" />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              primaryTypographyProps={{ color: "error" }}
            />
          </ListItem>
        </List>
      </Box>
    </SwipeableDrawer>
  );
};

export default MobileDrawer;
