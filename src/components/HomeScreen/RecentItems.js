import {
  Card,
  CardContent,
  Typography,
  Paper,
  Chip,
  Box,
} from "@mui/material";
import StorageIcon from "@mui/icons-material/Storage";

export const RecentItems = ({ recentItems }) => {
  return (
    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Recently Added Items
        </Typography>
        {recentItems.length > 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {recentItems.map((item) => (
              <Paper
                key={item.id}
                elevation={1}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {item.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.code || "No code"}
                  </Typography>
                </Box>
                <Box display="flex" gap={1}>
                  <Chip
                    label={`Cost: ${(parseFloat(item.price) || 0).toFixed(2)}`}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                  <Chip
                    label={`Sale: ${(
                      parseFloat(item.sellingPrice) || 0
                    ).toFixed(2)}`}
                    color="secondary"
                    variant="outlined"
                    size="small"
                  />
                  <Chip
                    label={`Qty: ${item.quantity || 1}`}
                    color="info"
                    variant="outlined"
                    size="small"
                  />
                  <Chip
                    label={`Profit: ${(
                      parseFloat(item.sellingPrice || 0) -
                      parseFloat(item.price || 0)
                    ).toFixed(2)}`}
                    color="success"
                    variant="outlined"
                    size="small"
                  />
                </Box>
              </Paper>
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              p: 4,
            }}
          >
            <StorageIcon
              sx={{ fontSize: 60, color: "text.disabled", mb: 2 }}
            />
            <Typography color="text.secondary">
              No recent items found
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};