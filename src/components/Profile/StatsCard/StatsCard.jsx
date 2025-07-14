import {
  Card,
  CardContent,
  Box,
  Typography,
  CircularProgress,
  useTheme,
} from "@mui/material";

const StatsCard = ({ icon, title, value, color }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 2,
        transition: "all 0.3s ease",
        background: isDark
          ? "linear-gradient(135deg, rgba(30,30,30,0.8), rgba(60,60,60,0.8))"
          : "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(245,245,245,0.9))",
        backdropFilter: "blur(6px)",
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.shadows[3],
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" mb={1} gap={1}>
          {icon}
          <Typography variant="h6" color="text.secondary">
            {title}
          </Typography>
        </Box>
        {value !== undefined ? (
          <Typography variant="h4" color={color || "primary"}>
            {value}
          </Typography>
        ) : (
          <CircularProgress size={24} />
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
