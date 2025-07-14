import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControlLabel,
  Switch,
} from "@mui/material";
import ThemeSwitcherDropdown from "../../context/ThemeSwitcher";

const AppearanceSettings = () => {
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
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Advanced Appearance Settings
          </Typography>
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Enable animations"
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={<Switch />}
            label="Compact mode"
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default AppearanceSettings;