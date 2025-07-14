import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  FormControlLabel,
  Switch,
  TextField,
  Button,
} from "@mui/material";

const BackupSettings = () => {
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [backupFrequency, setBackupFrequency] = useState("weekly");

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Backup Settings
      </Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Automatic Backups
          </Typography>
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
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Manual Backup
          </Typography>
          <Button variant="outlined" sx={{ mr: 2 }}>
            Create Backup Now
          </Button>
          <Button variant="text">Restore from Backup</Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default BackupSettings;