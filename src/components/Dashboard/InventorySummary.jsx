// src/components/InventorySummary/InventorySummary.jsx
import { Grid, Typography, Paper, Box, LinearProgress } from "@mui/material";

const InventorySummary = ({
  loading = false,
  totalItems = 0,
  totalValue = 0,
  categories = 0,
}) => {
  // Convert values to numbers to ensure they're safe for toFixed()
  const safeTotalValue = typeof totalValue === "number" ? totalValue : 0;
  const safeTotalItems = typeof totalItems === "number" ? totalItems : 0;
  const safeCategories = typeof categories === "number" ? categories : 0;

  return (
    <>
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Inventory Summary
      </Typography>
      <Paper elevation={2} sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ width: "100%" }}>
            <LinearProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Box textAlign="center">
                <Typography variant="h4">
                  {safeTotalItems.toLocaleString()}
                </Typography>
                <Typography variant="subtitle1">Total Items</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box textAlign="center">
                <Typography variant="h4">
                  {" "}
                  {safeTotalValue.toFixed(2)}
                </Typography>
                <Typography variant="subtitle1">Total Value</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box textAlign="center">
                <Typography variant="h4">{safeCategories}</Typography>
                <Typography variant="subtitle1">Categories</Typography>
              </Box>
            </Grid>
          </Grid>
        )}
      </Paper>
    </>
  );
};

export default InventorySummary;
