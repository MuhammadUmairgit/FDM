import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { Lock, Security } from "@mui/icons-material";

const SecuritySettings = () => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Security Settings
      </Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Password
          </Typography>
          <Button variant="contained" sx={{ mb: 2 }}>
            Change Password
          </Button>
          <Typography variant="body2" color="text.secondary">
            Last changed: 3 months ago
          </Typography>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Two-Factor Authentication
          </Typography>
          <FormControlLabel
            control={<Switch />}
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
};

export default SecuritySettings;