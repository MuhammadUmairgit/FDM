// src/pages/ProfileScreen/components/MobileBottomNav/MobileBottomNav.js
import { Paper, IconButton, Badge } from "@mui/material";
import {
  Person,
  AdminPanelSettings,
  Chat,
} from "@mui/icons-material";

const MobileBottomNav = ({ activeTab, setActiveTab, isAdmin }) => {
  return (
    <Paper
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        display: "flex",
        justifyContent: "space-around",
        p: 1,
        borderTop: "1px solid rgba(0,0,0,0.1)",
      }}
      elevation={3}
    >
      <IconButton
        onClick={() => setActiveTab(0)}
        color={activeTab === 0 ? "primary" : "default"}
        size="large"
      >
        <Person />
      </IconButton>
      {isAdmin && (
        <IconButton
          onClick={() => setActiveTab(1)}
          color={activeTab === 1 ? "primary" : "default"}
          size="large"
        >
          <AdminPanelSettings />
        </IconButton>
      )}
      <IconButton
        size="large"
      >
        <Badge badgeContent={0} color="primary">
          <Chat />
        </Badge>
      </IconButton>
    </Paper>
  );
};

export default MobileBottomNav;