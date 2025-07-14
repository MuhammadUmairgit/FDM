// src/pages/ProfileScreen/components/RoleDropdown/RoleDropdown.js
import { SupervisedUserCircle, VerifiedUser } from "@mui/icons-material";
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";

const RoleDropdown = ({ user, onRoleChange }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleToggle = () => {
    setOpen(!open);
  };

  const handleRoleChange = (role) => {
    onRoleChange(role);
    setOpen(false);
  };

  return (
    <Box
      ref={dropdownRef}
      sx={{
        position: "relative",
        display: "inline-block",
        ml: 1,
      }}
    >
      <Button
        variant="outlined"
        size="small"
        onClick={handleToggle}
        sx={{
          textTransform: "none",
          borderRadius: 2,
          pr: 1,
          pl: 1.5,
          bgcolor: open ? "action.hover" : "background.paper",
          transition: "all 0.2s ease",
          "&:hover": {
            bgcolor: "action.hover",
            transform: "translateY(-1px)",
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {user.role === "admin" ? (
            <VerifiedUser fontSize="small" color="secondary" sx={{ mr: 0.5 }} />
          ) : (
            <SupervisedUserCircle fontSize="small" sx={{ mr: 0.5 }} />
          )}
          <Typography variant="body2">
            {user.role === "admin" ? "Admin" : "User"}
          </Typography>
        </Box>
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              zIndex: 10,
              minWidth: "100%",
              marginTop: 4,
            }}
          >
            <Paper
              elevation={4}
              sx={{
                borderRadius: 2,
                overflow: "hidden",
                minWidth: 160,
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              }}
            >
              <List dense>
                <ListItem
                  button
                  onClick={() => handleRoleChange("admin")}
                  sx={{
                    bgcolor:
                      user.role === "admin" ? "primary.light" : "transparent",
                    transition: "background-color 0.2s",
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <VerifiedUser fontSize="small" color="secondary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Admin"
                    primaryTypographyProps={{
                      variant: "body2",
                      fontWeight: user.role === "admin" ? 600 : "normal",
                    }}
                  />
                  {/* {user.role === "admin" && (
                    <Check fontSize="small" color="primary" />
                  )} */}
                </ListItem>
                <ListItem
                  button
                  onClick={() => handleRoleChange("user")}
                  sx={{
                    bgcolor:
                      user.role === "user" ? "primary.light" : "transparent",
                    transition: "background-color 0.2s",
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <SupervisedUserCircle fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="User"
                    primaryTypographyProps={{
                      variant: "body2",
                      fontWeight: user.role === "user" ? 600 : "normal",
                    }}
                  />
                  {/* {user.role === "user" && (
                    <Check fontSize="small" color="primary" />
                  )} */}
                </ListItem>
              </List>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default RoleDropdown;
