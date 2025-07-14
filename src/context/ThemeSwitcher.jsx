import React from "react";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
  useTheme as useMuiTheme,
} from "@mui/material";
import { DarkMode, LightMode, SettingsBrightness } from "@mui/icons-material";
import { useTheme } from "./ThemeContext";

const themeOptions = [
  { value: "light", label: "Light", icon: <LightMode /> },
  { value: "dark", label: "Dark", icon: <DarkMode /> },
];

const ThemeSwitcherDropdown = () => {
  const { themeMode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleThemeChange = (mode) => {
    toggleTheme(mode);
    handleClose();
  };

  const getCurrentThemeIcon = () => {
    switch (themeMode) {
      case "dark":
        return <DarkMode />;
      case "light":
        return <LightMode />;
      default:
        return <SettingsBrightness />;
    }
  };

  return (
    <Box>
      <Tooltip title="Change theme">
        <IconButton
          onClick={handleClick}
          size="medium"
          sx={{
            ml: 2,
            border: `1px solid ${muiTheme.palette.divider}`,
            "&:hover": {
              backgroundColor: muiTheme.palette.action.hover,
            },
          }}
          aria-controls={open ? "theme-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
        >
          {getCurrentThemeIcon()}
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        id="theme-menu"
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 180,
            overflow: "visible",
            mt: 1.5,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1, fontWeight: 600 }}>
          Theme Preferences
        </Typography>
        {themeOptions.map((option) => (
          <MenuItem
            key={option.value}
            selected={themeMode === option.value}
            onClick={() => handleThemeChange(option.value)}
            sx={{
              minHeight: 48,
              "&.Mui-selected": {
                backgroundColor: muiTheme.palette.action.selected,
              },
              "&.Mui-selected:hover": {
                backgroundColor: muiTheme.palette.action.selected,
              },
            }}
          >
            <ListItemIcon sx={{ color: "inherit" }}>{option.icon}</ListItemIcon>
            <ListItemText primary={option.label} />
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default ThemeSwitcherDropdown;
