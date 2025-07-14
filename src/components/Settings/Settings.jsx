import React, { useState } from "react";
import {
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Avatar,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  useTheme,
} from "@mui/material";
import {
  Palette,
  Notifications,
  Language,
  Security,
  AccountCircle,
  Backup,
  Info,
  Lock,
  Email,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import ThemeSwitcherDropdown from "../../context/ThemeSwitcher";

const SettingsScreen = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("appearance");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [backupFrequency, setBackupFrequency] = useState("weekly");

  const { data: userPreferences, isLoading } = useQuery(
    "userPreferences",
    async () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            language: "en",
            timezone: "UTC",
            emailNotifications: true,
          });
        }, 500);
      });
    }
  );

  const settingsTabs = [
    { id: "appearance", label: "Appearance", icon: <Palette /> },
    { id: "notifications", label: "Notifications", icon: <Notifications /> },
    { id: "language", label: "Language", icon: <Language /> },
    { id: "security", label: "Security", icon: <Security /> },
    { id: "account", label: "Account", icon: <AccountCircle /> },
    { id: "backup", label: "Backup", icon: <Backup /> },
    { id: "about", label: "About", icon: <Info /> },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case "appearance":
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Theme Preferences
            </Typography>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1">Current Theme</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Customize the look and feel of the application
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} sx={{ textAlign: "right" }}>
                    <ThemeSwitcherDropdown />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="Advanced Appearance Settings" />
              <CardContent>
                <FormControlLabel
                  control={<Switch checked={true} />}
                  label="Enable animations"
                  sx={{ mb: 2 }}
                />
                <FormControlLabel
                  control={<Switch checked={false} />}
                  label="Compact mode"
                />
              </CardContent>
            </Card>
          </Box>
        );
      case "notifications":
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Notification Settings
            </Typography>
            <Card sx={{ mb: 3 }}>
              <CardHeader title="Email Notifications" />
              <CardContent>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationsEnabled}
                      onChange={(e) =>
                        setNotificationsEnabled(e.target.checked)
                      }
                    />
                  }
                  label="Enable email notifications"
                  sx={{ mb: 2 }}
                />
                {notificationsEnabled && (
                  <Box sx={{ pl: 4 }}>
                    <FormControlLabel
                      control={<Switch checked={true} />}
                      label="Low inventory alerts"
                      sx={{ mb: 1 }}
                    />
                    <FormControlLabel
                      control={<Switch checked={true} />}
                      label="Monthly reports"
                      sx={{ mb: 1 }}
                    />
                    <FormControlLabel
                      control={<Switch checked={false} />}
                      label="Promotional offers"
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        );
      case "security":
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Security Settings
            </Typography>
            <Card sx={{ mb: 3 }}>
              <CardHeader title="Password" avatar={<Lock />} />
              <CardContent>
                <Button variant="contained" sx={{ mb: 2 }}>
                  Change Password
                </Button>
                <Typography variant="body2" color="text.secondary">
                  Last changed: 3 months ago
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardHeader
                title="Two-Factor Authentication"
                avatar={<Security />}
              />
              <CardContent>
                <FormControlLabel
                  control={<Switch checked={false} />}
                  label="Enable two-factor authentication"
                  sx={{ mb: 2 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Add an extra layer of security to your account
                </Typography>
              </CardContent>
            </Card>
          </Box>
        );
      case "backup":
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Backup Settings
            </Typography>
            <Card sx={{ mb: 3 }}>
              <CardHeader title="Automatic Backups" />
              <CardContent>
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoBackupEnabled}
                      onChange={(e) => setAutoBackupEnabled(e.target.checked)}
                    />
                  }
                  label="Enable automatic backups"
                  sx={{ mb: 2 }}
                />
                {autoBackupEnabled && (
                  <Box sx={{ pl: 4 }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      Backup Frequency
                    </Typography>
                    <TextField
                      select
                      fullWidth
                      value={backupFrequency}
                      onChange={(e) => setBackupFrequency(e.target.value)}
                      SelectProps={{
                        native: true,
                      }}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </TextField>
                  </Box>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader title="Manual Backup" />
              <CardContent>
                <Button variant="outlined" sx={{ mr: 2 }}>
                  Create Backup Now
                </Button>
                <Button variant="text">Restore from Backup</Button>
              </CardContent>
            </Card>
          </Box>
        );
      default:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              {settingsTabs.find((tab) => tab.id === activeTab)?.label} Settings
            </Typography>
            <Card>
              <CardContent>
                <Typography>
                  Settings for this section will be available soon.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        );
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: 280,
          height: "100vh",
          position: "sticky",
          top: 0,
          borderRight: `1px solid ${theme.palette.divider}`,
          bgcolor: "background.paper",
        }}
      >
        <Box
          sx={{
            p: 3,
            display: "flex",
            alignItems: "center",
            gap: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Avatar sx={{ bgcolor: "primary.main" }}>IP</Avatar>
          <Typography variant="h6">InventoryPro</Typography>
        </Box>
        <List>
          {settingsTabs.map((tab) => (
            <ListItem
              button
              key={tab.id}
              selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: theme.palette.action.selected,
                  borderRight: `3px solid ${theme.palette.primary.main}`,
                },
                "&.Mui-selected:hover": {
                  backgroundColor: theme.palette.action.selected,
                },
              }}
            >
              <ListItemIcon sx={{ color: "inherit" }}>{tab.icon}</ListItemIcon>
              <ListItemText primary={tab.label} />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 4,
          maxWidth: "calc(100% - 280px)",
        }}
      >
        <Typography variant="h4" sx={{ mb: 3 }}>
          {settingsTabs.find((tab) => tab.id === activeTab)?.label} Settings
        </Typography>
        {renderActiveTab()}
      </Box>
    </Box>
  );
};

export default SettingsScreen;
