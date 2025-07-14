// src/pages/ProfileScreen/components/UserProfile/UserProfile.js
import  { useState } from "react";
import {
  Card,
  CardContent,
  Box,
  Avatar,
  Badge,
  IconButton,
  Typography,
  Chip,
  Button,
  LinearProgress,
  Grid,
} from "@mui/material";
import {
  CameraAlt,
  Logout,
  AdminPanelSettings,
  Person,
  Inventory,
  Category,
  Warning,
  VerifiedUser,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import StatsCard from "../StatsCard/StatsCard";

const UserProfile = ({ userData, isAdmin }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const stats = [
    {
      icon: <Inventory color="primary" sx={{ mr: 1 }} />,
      title: "Products",
      value: 42,
      color: "primary",
    },
    {
      icon: <Category color="primary" sx={{ mr: 1 }} />,
      title: "Categories",
      value: 8,
      color: "primary",
    },
    {
      icon: <Warning color="error" sx={{ mr: 1 }} />,
      title: "Low Stock",
      value: 3,
      color: "error",
    },
  ];

  return (
    <>
      <Card sx={{ mb: 3, borderRadius: { xs: 0, sm: 2 } }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 3,
            }}
          >
            {/* Profile Picture */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                badgeContent={
                  <label htmlFor="profile-picture-upload">
                    <IconButton component="span" size="small">
                      <CameraAlt fontSize="small" />
                    </IconButton>
                  </label>
                }
              >
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.2 }}
                >
                  <Avatar
                    src={userData?.photoURL}
                    sx={{
                      width: 120,
                      height: 120,
                      boxShadow: 3,
                    }}
                  />
                </motion.div>
                <input
                  id="profile-picture-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                />
              </Badge>

              {isUploading && (
                <Box sx={{ width: "100%", mt: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={uploadProgress}
                  />
                  <Typography
                    variant="caption"
                    display="block"
                    textAlign="center"
                  >
                    {uploadProgress}%
                  </Typography>
                </Box>
              )}
            </Box>

            {/* User Info */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" gutterBottom>
                {userData?.displayName || userData?.email}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip
                  label={isAdmin ? "Administrator" : "User"}
                  color={isAdmin ? "secondary" : "default"}
                  size="small"
                  sx={{
                    mb: 2,
                    boxShadow: 1,
                  }}
                  icon={
                    isAdmin ? (
                      <AdminPanelSettings fontSize="small" />
                    ) : (
                      <Person fontSize="small" />
                    )
                  }
                />
                {isAdmin && (
                  <VerifiedUser
                    color="secondary"
                    fontSize="small"
                    sx={{
                      filter: "drop-shadow(0 0 4px rgba(0, 0, 0, 0.1))",
                    }}
                  />
                )}
              </Box>

              <Typography variant="body2" color="text.secondary" paragraph>
                Member since:{" "}
                {userData?.createdAt?.toDate
                  ? userData.createdAt.toDate().toLocaleDateString()
                  : "N/A"}
              </Typography>

              <Button
                variant="outlined"
                color="error"
                startIcon={<Logout />}
                sx={{
                  mt: 2,
                  boxShadow: 1,
                  "&:hover": {
                    transform: "translateY(-1px)",
                  },
                  transition: "transform 0.2s",
                }}
              >
                Logout
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Stats Section */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={4} key={index}>
            <motion.div
              whileHover={{
                scale: 1.02,
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              }}
              transition={{ duration: 0.2 }}
            >
              <StatsCard
                icon={stat.icon}
                title={stat.title}
                value={stat.value}
                color={stat.color}
              />
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default UserProfile;
