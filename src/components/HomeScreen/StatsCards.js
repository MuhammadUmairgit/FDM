import { Card, CardContent, Typography, Box, Grid } from "@mui/material";
import StorageIcon from "@mui/icons-material/Storage";

// Add these imports at the top of HomeScreen.js
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TimelineIcon from "@mui/icons-material/Timeline";

export const StatsCards = ({ totalItems, totalValue, categories }) => {
  return (
    <Grid container spacing={3}>
      {/* First Card - Total Items */}
      <Grid item xs={12} md={3} minWidth={"30%"}>
        <Card sx={{ borderRadius: 3, boxShadow: 3, height: "100%" }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  gutterBottom
                >
                  Total Items
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {totalItems}
                </Typography>
              </Box>
              <Box
                sx={{
                  bgcolor: "primary.light",
                  p: 2,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <StorageIcon fontSize="large" />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Second Card - Total Value (larger) */}
      <Grid item xs={12} md={6} minWidth={"35%"}>
        <Card sx={{ borderRadius: 3, boxShadow: 3, height: "100%" }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  gutterBottom
                >
                  Total Value
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  ${totalValue.toFixed(2)}
                </Typography>
              </Box>
              <Box
                sx={{
                  bgcolor: "success.light",
                  p: 2,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AttachMoneyIcon fontSize="large" />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Third Card - Categories */}
      <Grid item xs={12} md={3} minWidth={"30%"}>
        <Card sx={{ borderRadius: 3, boxShadow: 3, height: "100%" }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  gutterBottom
                >
                  Categories
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {categories}
                </Typography>
              </Box>
              <Box
                sx={{
                  bgcolor: "secondary.light",
                  p: 2,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TimelineIcon fontSize="large" />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
