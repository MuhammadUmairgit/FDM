// src/pages/ProfileScreen/components/AddUserDialog/AddUserDialog.js
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Button,
  Box,
} from "@mui/material";
import { AdminPanelSettings, Person } from "@mui/icons-material";

const AddUserDialog = ({ open, onClose, onAddUser }) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");

  const handleAdd = () => {
    if (email.trim()) {
      onAddUser(email, role);
      setEmail("");
      setRole("user");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Add New User</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Email"
          type="email"
          fullWidth
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mt: 1 }}
        />
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Role
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant={role === "admin" ? "contained" : "outlined"}
              onClick={() => setRole("admin")}
              startIcon={<AdminPanelSettings />}
              fullWidth
              sx={{
                textTransform: "none",
              }}
            >
              Admin
            </Button>
            <Button
              variant={role === "user" ? "contained" : "outlined"}
              onClick={() => setRole("user")}
              startIcon={<Person />}
              fullWidth
              sx={{
                textTransform: "none",
              }}
            >
              User
            </Button>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleAdd}
          variant="contained"
          disabled={!email.trim()}
          sx={{
            textTransform: "none",
          }}
        >
          Add User
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddUserDialog;