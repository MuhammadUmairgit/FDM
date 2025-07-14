import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Typography, Card, CardContent, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export const ProfitChart = ({ profitData }) => {
  const theme = useTheme();

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Profit by Category
        </Typography>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={profitData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip
                formatter={(value) => [
                  `${value.toFixed(2)}`,
                  value === "profit" ? "Profit" : "Revenue",
                ]}
              />
              <Legend />
              <Bar
                dataKey="profit"
                fill={theme.palette.success.main}
                name="Profit"
              />
              <Bar
                dataKey="revenue"
                fill={theme.palette.primary.main}
                name="Revenue"
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};