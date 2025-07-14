// src/pages/ProfileScreen/components/MobileAppBar/MobileAppBar.js
import { Box, Typography, IconButton } from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";

const MobileAppBar = ({ toggleDrawer }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        p: 2,
        mb: 2,
        bgcolor: "background.paper",
        boxShadow: 1,
        borderRadius: 0,
      }}
    >
      <IconButton onClick={toggleDrawer}>
        <MenuIcon />
      </IconButton>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        My Profile
      </Typography>
      <Box sx={{ width: 40 }} />
    </Box>
  );
};

export default MobileAppBar;
