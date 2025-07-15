import dayjs from 'dayjs';

// Format currency
export const formatCurrency = (amount) => {
  if (!amount || isNaN(amount)) return '₹0';
  return `₹${amount.toLocaleString('en-IN')}`;
};

// Format date
export const formatDate = (date, format = 'DD/MM/YYYY') => {
  if (!date) return '';
  return dayjs(date).format(format);
};

// Calculate transaction totals
export const calculateTotals = (transactions) => {
  const totals = {
    credit: 0,
    debit: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
    total: 0
  };

  transactions.forEach(transaction => {
    const amount = transaction.amount || 0;
    
    // By transaction type
    if (transaction.type === 'credit') {
      totals.credit += amount;
    } else if (transaction.type === 'debit') {
      totals.debit += amount;
    }
    
    // By status
    if (transaction.status === 'pending') {
      totals.pending += amount;
    } else if (transaction.status === 'completed') {
      totals.completed += amount;
    } else if (transaction.status === 'cancelled') {
      totals.cancelled += amount;
    }
    
    // Total
    totals.total += amount;
  });

  return totals;
};

// Calculate customer balance
export const calculateCustomerBalance = (transactions) => {
  let balance = 0;
  
  transactions.forEach(transaction => {
    if (transaction.type === 'credit') {
      balance += transaction.amount || 0;
    } else if (transaction.type === 'debit') {
      balance -= transaction.amount || 0;
    }
  });
  
  return balance;
};

// Get transaction statistics for a date range
export const getTransactionStats = (transactions, startDate, endDate) => {
  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = dayjs(transaction.createdAt?.toDate());
    return transactionDate.isAfter(startDate) && transactionDate.isBefore(endDate);
  });

  return {
    count: filteredTransactions.length,
    totals: calculateTotals(filteredTransactions),
    transactions: filteredTransactions
  };
};

// Get monthly transaction data
export const getMonthlyData = (transactions) => {
  const monthlyData = {};
  
  transactions.forEach(transaction => {
    const month = dayjs(transaction.createdAt?.toDate()).format('YYYY-MM');
    
    if (!monthlyData[month]) {
      monthlyData[month] = {
        month,
        credit: 0,
        debit: 0,
        count: 0,
        total: 0
      };
    }
    
    const amount = transaction.amount || 0;
    
    if (transaction.type === 'credit') {
      monthlyData[month].credit += amount;
    } else if (transaction.type === 'debit') {
      monthlyData[month].debit += amount;
    }
    
    monthlyData[month].count += 1;
    monthlyData[month].total += amount;
  });

  return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
};

// Generate report data
export const generateReportData = (transactions, customers) => {
  const totals = calculateTotals(transactions);
  const monthlyData = getMonthlyData(transactions);
  
  // Top customers by transaction amount
  const customerTotals = {};
  transactions.forEach(transaction => {
    const customerId = transaction.customerId;
    if (!customerTotals[customerId]) {
      customerTotals[customerId] = {
        customerId,
        customerName: transaction.customerName,
        totalAmount: 0,
        transactionCount: 0
      };
    }
    customerTotals[customerId].totalAmount += transaction.amount || 0;
    customerTotals[customerId].transactionCount += 1;
  });

  const topCustomers = Object.values(customerTotals)
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 10);

  return {
    totals,
    monthlyData,
    topCustomers,
    totalCustomers: customers.length,
    totalTransactions: transactions.length
  };
};

// Search and filter transactions
export const filterTransactions = (transactions, filters) => {
  let filtered = [...transactions];

  // Search filter
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(transaction =>
      transaction.description?.toLowerCase().includes(query) ||
      transaction.customerName?.toLowerCase().includes(query) ||
      transaction.amount?.toString().includes(query)
    );
  }

  // Status filter
  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter(transaction => transaction.status === filters.status);
  }

  // Type filter
  if (filters.type && filters.type !== 'all') {
    filtered = filtered.filter(transaction => transaction.type === filters.type);
  }

  // Date range filter
  if (filters.dateRange && filters.dateRange.length === 2) {
    const [startDate, endDate] = filters.dateRange;
    filtered = filtered.filter(transaction => {
      const transactionDate = dayjs(transaction.createdAt?.toDate());
      return transactionDate.isAfter(startDate) && transactionDate.isBefore(endDate);
    });
  }

  // Customer filter
  if (filters.customerId) {
    filtered = filtered.filter(transaction => transaction.customerId === filters.customerId);
  }

  // Amount range filter
  if (filters.minAmount !== undefined) {
    filtered = filtered.filter(transaction => (transaction.amount || 0) >= filters.minAmount);
  }
  if (filters.maxAmount !== undefined) {
    filtered = filtered.filter(transaction => (transaction.amount || 0) <= filters.maxAmount);
  }

  return filtered;
};

// Sort transactions
export const sortTransactions = (transactions, sortBy, sortOrder = 'desc') => {
  return [...transactions].sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case 'date':
        aValue = a.createdAt?.toDate() || new Date(0);
        bValue = b.createdAt?.toDate() || new Date(0);
        break;
      case 'amount':
        aValue = a.amount || 0;
        bValue = b.amount || 0;
        break;
      case 'customer':
        aValue = a.customerName || '';
        bValue = b.customerName || '';
        break;
      case 'status':
        aValue = a.status || '';
        bValue = b.status || '';
        break;
      default:
        aValue = a[sortBy] || '';
        bValue = b[sortBy] || '';
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
};

// Generate transaction ID
export const generateTransactionId = () => {
  return `TXN${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
};

// Validate phone number
export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
};

// Validate email
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Export to CSV
export const exportToCSV = (data, filename = 'transactions.csv') => {
  const csvContent = "data:text/csv;charset=utf-8," + data.map(e => e.join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Format transaction data for export
export const formatTransactionForExport = (transactions) => {
  const headers = ['Date', 'Customer', 'Description', 'Amount', 'Type', 'Status'];
  const rows = transactions.map(transaction => [
    formatDate(transaction.createdAt?.toDate()),
    transaction.customerName || '',
    transaction.description || '',
    transaction.amount || 0,
    transaction.type || '',
    transaction.status || ''
  ]);

  return [headers, ...rows];
};

// Get color for transaction type
export const getTransactionColor = (type) => {
  switch (type) {
    case 'credit':
      return '#52c41a';
    case 'debit':
      return '#f5222d';
    default:
      return '#1890ff';
  }
};

// Get color for transaction status
export const getStatusColor = (status) => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

// Calculate interest or late fees (if needed)
export const calculateInterest = (amount, days, rate = 0.01) => {
  return (amount * days * rate) / 100;
};

// Get upcoming due dates
export const getUpcomingDueDates = (transactions, days = 7) => {
  const upcoming = [];
  const today = dayjs();
  
  transactions.forEach(transaction => {
    if (transaction.dueDate && transaction.status === 'pending') {
      const dueDate = dayjs(transaction.dueDate);
      const daysUntilDue = dueDate.diff(today, 'days');
      
      if (daysUntilDue <= days && daysUntilDue >= 0) {
        upcoming.push({
          ...transaction,
          daysUntilDue
        });
      }
    }
  });
  
  return upcoming.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
};

// Generate backup data
export const generateBackupData = (customers, transactions) => {
  return {
    customers,
    transactions,
    exportDate: new Date().toISOString(),
    version: '1.0.0'
  };
};

// Parse backup data
export const parseBackupData = (backupData) => {
  try {
    const parsed = JSON.parse(backupData);
    return {
      customers: parsed.customers || [],
      transactions: parsed.transactions || [],
      exportDate: parsed.exportDate,
      version: parsed.version
    };
  } catch (error) {
    throw new Error('Invalid backup data format');
  }
};

export default {
  formatCurrency,
  formatDate,
  calculateTotals,
  calculateCustomerBalance,
  getTransactionStats,
  getMonthlyData,
  generateReportData,
  filterTransactions,
  sortTransactions,
  generateTransactionId,
  validatePhoneNumber,
  validateEmail,
  exportToCSV,
  formatTransactionForExport,
  getTransactionColor,
  getStatusColor,
  calculateInterest,
  getUpcomingDueDates,
  generateBackupData,
  parseBackupData
};