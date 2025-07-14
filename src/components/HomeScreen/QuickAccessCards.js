import { motion } from "framer-motion";

import { Card, CardContent, Typography, Box } from "@mui/material";
// Correct way to import MUI icons:
import AnalyticsIcon from "@mui/icons-material/Analytics";
import PersonIcon from "@mui/icons-material/Person";
import AddIcon from "@mui/icons-material/Add";
import PeopleIcon from "@mui/icons-material/People";

const quickAccessItems = [
  {
    name: "Contacts",
    icon: <PeopleIcon fontSize="large" />,
    color: "primary.main",
    path: "/customers",
  },
  {
    name: "Analytics",
    icon: <AnalyticsIcon fontSize="large" />,
    color: "secondary.main",
    path: "/analytics",
  },
  {
    name: "Profile",
    icon: <PersonIcon fontSize="large" />,
    color: "success.main",
    path: "/profile",
  },
  {
    name: "Add Item",
    icon: <AddIcon fontSize="large" />,
    color: "warning.main",
    action: "addItem",
  },
];

export const QuickAccessCards = ({ onNavigate, onAddItem, isMobile }) => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
        gap: 3,
      }}
    >
      {quickAccessItems.map((item) => (
        <motion.div
          key={item.name}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card
            onClick={() =>
              item.action === "addItem" ? onAddItem() : onNavigate(item.path)
            }
            sx={{
              borderRadius: 3,
              boxShadow: 3,
              bgcolor: `${item.color}20`,
              cursor: "pointer",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: 6,
              },
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                p: 4,
              }}
            >
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  bgcolor: `${item.color}30`,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2,
                }}
              >
                {item.icon}
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: item.color,
                  textAlign: "center",
                }}
              >
                {item.name}
              </Typography>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </Box>
  );
};
