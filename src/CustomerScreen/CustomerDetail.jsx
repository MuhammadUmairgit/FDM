// src/pages/CustomerDetail.js
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Typography,
  Avatar,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  useTheme,
  styled,
  Grid,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Receipt as ReceiptIcon,
  MoneyOff as MoneyOffIcon,
  AttachMoney as AttachMoneyIcon,
} from "@mui/icons-material";
import { collection, query, where, getDocs } from "firebase/firestore";
import { format } from "date-fns";
import { db } from "../firebase/firebaseConfig";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 600,
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1),
    fontSize: "0.875rem",
  },
}));

const BalanceTableCell = styled(TableCell)(({ theme, balance }) => ({
  fontWeight: 700,
  color: balance >= 0 ? theme.palette.success.main : theme.palette.error.main,
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1),
    fontSize: "0.875rem",
  },
}));

const CustomerDetail = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { customerId } = useParams();

  // Fetch customer details
  const { data: customer, isLoading: customerLoading } = useQuery(
    ["customer", customerId],
    async () => {
      const q = query(
        collection(db, "customers"),
        where("id", "==", customerId)
      );
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        throw new Error("Customer not found");
      }
      return querySnapshot.docs[0].data();
    }
  );

  // Fetch transactions
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery(
    ["transactions", customerId],
    async () => {
      const q = query(
        collection(db, "transactions"),
        where("customerId", "==", customerId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate(), // Convert Firestore timestamp to Date
      }));
    }
  );

  // Calculate balances
  const { given, taken, balance } = React.useMemo(() => {
    const given = transactions
      .filter((t) => t.type === "given")
      .reduce((sum, t) => sum + t.amount, 0);

    const taken = transactions
      .filter((t) => t.type === "taken")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      given,
      taken,
      balance: given - taken,
    };
  }, [transactions]);

  // Calculate running balances for each transaction
  const transactionsWithBalance = React.useMemo(() => {
    let runningGiven = 0;
    let runningTaken = 0;

    return transactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map((t) => {
        if (t.type === "given") runningGiven += t.amount;
        if (t.type === "taken") runningTaken += t.amount;

        return {
          ...t,
          runningBalance: runningGiven - runningTaken,
        };
      });
  }, [transactions]);

  if (customerLoading || transactionsLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!customer) {
    return (
      <Box textAlign="center" p={4}>
        <Typography variant="h5" color="error">
          Customer not found
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/customers")}
          sx={{ mt: 2 }}
        >
          Back to Customers
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 3 }, maxWidth: 1200, margin: "0 auto" }}>
      {/* Header and Back Button */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton onClick={() => navigate("/customers")} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Customer Details
        </Typography>
      </Box>

      {/* Customer Info Card */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm="auto">
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  fontSize: 32,
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                }}
              >
                {customer.name?.charAt(0)?.toUpperCase() || "?"}
              </Avatar>
            </Grid>
            <Grid item xs={12} sm>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                {customer.name || "No Name"}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                <strong>Phone:</strong> {customer.phone || "Not provided"}
              </Typography>
              {customer.email && (
                <Typography variant="body1" color="text.secondary">
                  <strong>Email:</strong> {customer.email}
                </Typography>
              )}
              {customer.address && (
                <Typography variant="body1" color="text.secondary">
                  <strong>Address:</strong> {customer.address}
                </Typography>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Balance Summary */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, height: "100%" }}>
            <CardContent>
              <Typography variant="subtitle1" color="text.secondary">
                Total Given
              </Typography>
              <Typography
                variant="h4"
                sx={{ color: "success.main", fontWeight: 700 }}
              >
                {given.toLocaleString()}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                <AttachMoneyIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Amount you've given
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, height: "100%" }}>
            <CardContent>
              <Typography variant="subtitle1" color="text.secondary">
                Total Taken
              </Typography>
              <Typography
                variant="h4"
                sx={{ color: "error.main", fontWeight: 700 }}
              >
                {taken.toLocaleString()}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                <MoneyOffIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Amount you've received
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, height: "100%" }}>
            <CardContent>
              <Typography variant="subtitle1" color="text.secondary">
                Current Balance
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  color: balance >= 0 ? "success.main" : "error.main",
                  fontWeight: 700,
                }}
              >
                {Math.abs(balance).toLocaleString()}
              </Typography>
              <Chip
                label={balance >= 0 ? "You will receive" : "You will give"}
                size="small"
                sx={{
                  mt: 1,
                  backgroundColor:
                    balance >= 0 ? "success.light" : "error.light",
                  color: balance >= 0 ? "success.dark" : "error.dark",
                }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Transaction Actions */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          color="success"
          startIcon={<AddIcon />}
          onClick={() =>
            navigate(`/transactions/new?customerId=${customerId}&type=given`)
          }
          sx={{ borderRadius: 3, px: 3, py: 1.5, fontWeight: 600 }}
        >
          Add Given
        </Button>
        <Button
          variant="contained"
          color="error"
          startIcon={<AddIcon />}
          onClick={() =>
            navigate(`/transactions/new?customerId=${customerId}&type=taken`)
          }
          sx={{ borderRadius: 3, px: 3, py: 1.5, fontWeight: 600 }}
        >
          Add Taken
        </Button>
      </Box>

      {/* Transactions Table */}
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead sx={{ bgcolor: theme.palette.grey[100] }}>
                <TableRow>
                  <StyledTableCell>Date</StyledTableCell>
                  <StyledTableCell align="right">Type</StyledTableCell>
                  <StyledTableCell align="right">Amount</StyledTableCell>
                  <StyledTableCell align="right">Balance</StyledTableCell>
                  <StyledTableCell align="center">Actions</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactionsWithBalance.length > 0 ? (
                  transactionsWithBalance.map((transaction) => (
                    <TableRow
                      key={transaction.id}
                      sx={{
                        "&:nth-of-type(odd)": {
                          backgroundColor: theme.palette.action.hover,
                        },
                        "&:last-child td": {
                          borderBottom: 0,
                        },
                      }}
                    >
                      <StyledTableCell>
                        {transaction.date
                          ? format(transaction.date, "PPpp")
                          : "Unknown date"}
                      </StyledTableCell>
                      <StyledTableCell align="right">
                        <Chip
                          label={
                            transaction.type === "given" ? "Given" : "Taken"
                          }
                          size="small"
                          sx={{
                            backgroundColor:
                              transaction.type === "given"
                                ? "success.light"
                                : "error.light",
                            color:
                              transaction.type === "given"
                                ? "success.dark"
                                : "error.dark",
                          }}
                        />
                      </StyledTableCell>
                      <StyledTableCell
                        align="right"
                        sx={{
                          color:
                            transaction.type === "given"
                              ? "success.main"
                              : "error.main",
                          fontWeight: 600,
                        }}
                      >
                        {transaction.amount.toLocaleString()}
                      </StyledTableCell>
                      <BalanceTableCell
                        align="right"
                        balance={transaction.runningBalance}
                      >
                        {Math.abs(transaction.runningBalance).toLocaleString()}
                      </BalanceTableCell>
                      <StyledTableCell align="center">
                        <Tooltip title="View Details">
                          <IconButton
                            onClick={() =>
                              navigate(`/transactions/${transaction.id}`)
                            }
                            size="small"
                          >
                            <ReceiptIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </StyledTableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <ReceiptIcon
                          sx={{ fontSize: 60, color: "text.disabled", mb: 1 }}
                        />
                        <Typography variant="body1" color="text.secondary">
                          No transactions found for this customer
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CustomerDetail;
