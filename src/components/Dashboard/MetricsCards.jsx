// src/components/DashboardScreen/MetricsCards.jsx
import { Grid, Card, CardContent, Typography, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";

const MetricCard = ({ item }) => {
  const theme = useTheme();

  const getIcon = (iconName) => {
    switch (iconName) {
      case "inventory":
        return <InventoryIcon fontSize="large" />;
      case "warning":
        return <WarningIcon fontSize="large" />;
      case "error":
        return <ErrorIcon fontSize="large" />;
      case "trending_up":
        return <TrendingUpIcon fontSize="large" />;
      default:
        return <InventoryIcon fontSize="large" />;
    }
  };

  return (
    <Grid item xs={12} sm={6} md={3} width={230}>
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          cursor: item.onPress ? "pointer" : "default",
          transition: "transform 0.2s",
          "&:hover": {
            transform: item.onPress ? "scale(1.03)" : "none",
          },
        }}
        onClick={item.onPress}
        elevation={3}
      >
        <CardContent
          sx={{
            backgroundColor: item.color,
            color: theme.palette.getContrastText(item.color),
            flexGrow: 1,
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="h5" component="div">
                {item.value}
              </Typography>
              <Typography variant="subtitle1">{item.title}</Typography>
            </Box>
            <Box>
              {getIcon(item.icon)}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );
};

const MetricsCards = ({ metrics }) => {
  return (
    <Grid container spacing={2} mt={5} mb={5}>
      {metrics.map((metric) => (
        <MetricCard key={metric.id} item={metric} />
      ))}
    </Grid>
  );
};

export default MetricsCards;