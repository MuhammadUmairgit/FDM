import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useAuth } from '../components/Auth/AuthContext';
import { db } from '../firebase/firebaseConfig';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  increment,
  writeBatch
} from 'firebase/firestore';
import { message } from 'antd';
import { 
  calculateTotals, 
  generateReportData, 
  filterTransactions, 
  sortTransactions 
} from '../utils/khataHelpers';

// Initial state
const initialState = {
  customers: [],
  transactions: [],
  stats: {
    totalCustomers: 0,
    totalTransactions: 0,
    totalAmount: 0,
    pendingAmount: 0,
    completedAmount: 0,
    monthlyRevenue: 0,
    creditTotal: 0,
    debitTotal: 0
  },
  loading: {
    customers: false,
    transactions: false,
    adding: false,
    updating: false,
    deleting: false
  },
  filters: {
    searchQuery: '',
    status: 'all',
    type: 'all',
    dateRange: null,
    customerId: null
  },
  sortBy: 'date',
  sortOrder: 'desc'
};

// Action types
const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_CUSTOMERS: 'SET_CUSTOMERS',
  SET_TRANSACTIONS: 'SET_TRANSACTIONS',
  ADD_CUSTOMER: 'ADD_CUSTOMER',
  UPDATE_CUSTOMER: 'UPDATE_CUSTOMER',
  DELETE_CUSTOMER: 'DELETE_CUSTOMER',
  ADD_TRANSACTION: 'ADD_TRANSACTION',
  UPDATE_TRANSACTION: 'UPDATE_TRANSACTION',
  DELETE_TRANSACTION: 'DELETE_TRANSACTION',
  SET_FILTERS: 'SET_FILTERS',
  SET_SORT: 'SET_SORT',
  UPDATE_STATS: 'UPDATE_STATS',
  RESET_STATE: 'RESET_STATE'
};

// Reducer
const khataReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value
        }
      };

    case actionTypes.SET_CUSTOMERS:
      return {
        ...state,
        customers: action.payload,
        loading: {
          ...state.loading,
          customers: false
        }
      };

    case actionTypes.SET_TRANSACTIONS:
      return {
        ...state,
        transactions: action.payload,
        loading: {
          ...state.loading,
          transactions: false
        }
      };

    case actionTypes.ADD_CUSTOMER:
      return {
        ...state,
        customers: [action.payload, ...state.customers],
        loading: {
          ...state.loading,
          adding: false
        }
      };

    case actionTypes.UPDATE_CUSTOMER:
      return {
        ...state,
        customers: state.customers.map(customer =>
          customer.id === action.payload.id ? action.payload : customer
        ),
        loading: {
          ...state.loading,
          updating: false
        }
      };

    case actionTypes.DELETE_CUSTOMER:
      return {
        ...state,
        customers: state.customers.filter(customer => customer.id !== action.payload),
        loading: {
          ...state.loading,
          deleting: false
        }
      };

    case actionTypes.ADD_TRANSACTION:
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
        loading: {
          ...state.loading,
          adding: false
        }
      };

    case actionTypes.UPDATE_TRANSACTION:
      return {
        ...state,
        transactions: state.transactions.map(transaction =>
          transaction.id === action.payload.id ? action.payload : transaction
        ),
        loading: {
          ...state.loading,
          updating: false
        }
      };

    case actionTypes.DELETE_TRANSACTION:
      return {
        ...state,
        transactions: state.transactions.filter(transaction => transaction.id !== action.payload),
        loading: {
          ...state.loading,
          deleting: false
        }
      };

    case actionTypes.SET_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload
        }
      };

    case actionTypes.SET_SORT:
      return {
        ...state,
        sortBy: action.payload.sortBy,
        sortOrder: action.payload.sortOrder
      };

    case actionTypes.UPDATE_STATS:
      return {
        ...state,
        stats: action.payload
      };

    case actionTypes.RESET_STATE:
      return initialState;

    default:
      return state;
  }
};

// Context
const KhataContext = createContext();

// Provider component
export const KhataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(khataReducer, initialState);
  const { currentUser } = useAuth();

  // Calculate and update statistics
  const updateStats = useCallback(() => {
    const { customers, transactions } = state;
    const totals = calculateTotals(transactions);
    
    const stats = {
      totalCustomers: customers.length,
      totalTransactions: transactions.length,
      totalAmount: totals.total,
      pendingAmount: totals.pending,
      completedAmount: totals.completed,
      creditTotal: totals.credit,
      debitTotal: totals.debit,
      monthlyRevenue: totals.completed // This could be refined to actual monthly data
    };

    dispatch({
      type: actionTypes.UPDATE_STATS,
      payload: stats
    });
  }, [state.customers, state.transactions]);

  // Load customers from Firestore
  const loadCustomers = useCallback(() => {
    if (!currentUser) return;

    dispatch({ type: actionTypes.SET_LOADING, payload: { key: 'customers', value: true } });

    const q = query(
      collection(db, 'customers'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const customers = [];
        snapshot.forEach((doc) => {
          customers.push({
            id: doc.id,
            ...doc.data()
          });
        });
        dispatch({ type: actionTypes.SET_CUSTOMERS, payload: customers });
      },
      (error) => {
        console.error('Error loading customers:', error);
        message.error('Failed to load customers');
        dispatch({ type: actionTypes.SET_LOADING, payload: { key: 'customers', value: false } });
      }
    );

    return unsubscribe;
  }, [currentUser]);

  // Load transactions from Firestore
  const loadTransactions = useCallback(() => {
    if (!currentUser) return;

    dispatch({ type: actionTypes.SET_LOADING, payload: { key: 'transactions', value: true } });

    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const transactions = [];
        snapshot.forEach((doc) => {
          transactions.push({
            id: doc.id,
            ...doc.data()
          });
        });
        dispatch({ type: actionTypes.SET_TRANSACTIONS, payload: transactions });
      },
      (error) => {
        console.error('Error loading transactions:', error);
        message.error('Failed to load transactions');
        dispatch({ type: actionTypes.SET_LOADING, payload: { key: 'transactions', value: false } });
      }
    );

    return unsubscribe;
  }, [currentUser]);

  // Add customer
  const addCustomer = async (customerData) => {
    if (!currentUser) return;

    dispatch({ type: actionTypes.SET_LOADING, payload: { key: 'adding', value: true } });

    try {
      const docRef = await addDoc(collection(db, 'customers'), {
        ...customerData,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        totalAmount: 0,
        pendingAmount: 0,
        completedAmount: 0,
        transactionCount: 0
      });

      const newCustomer = {
        id: docRef.id,
        ...customerData,
        userId: currentUser.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        totalAmount: 0,
        pendingAmount: 0,
        completedAmount: 0,
        transactionCount: 0
      };

      dispatch({ type: actionTypes.ADD_CUSTOMER, payload: newCustomer });
      message.success('Customer added successfully');
      return newCustomer;
    } catch (error) {
      console.error('Error adding customer:', error);
      message.error('Failed to add customer');
      dispatch({ type: actionTypes.SET_LOADING, payload: { key: 'adding', value: false } });
      throw error;
    }
  };

  // Update customer
  const updateCustomer = async (customerId, updates) => {
    if (!currentUser) return;

    dispatch({ type: actionTypes.SET_LOADING, payload: { key: 'updating', value: true } });

    try {
      const customerRef = doc(db, 'customers', customerId);
      await updateDoc(customerRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      const updatedCustomer = {
        ...state.customers.find(c => c.id === customerId),
        ...updates,
        updatedAt: new Date()
      };

      dispatch({ type: actionTypes.UPDATE_CUSTOMER, payload: updatedCustomer });
      message.success('Customer updated successfully');
      return updatedCustomer;
    } catch (error) {
      console.error('Error updating customer:', error);
      message.error('Failed to update customer');
      dispatch({ type: actionTypes.SET_LOADING, payload: { key: 'updating', value: false } });
      throw error;
    }
  };

  // Delete customer
  const deleteCustomer = async (customerId) => {
    if (!currentUser) return;

    dispatch({ type: actionTypes.SET_LOADING, payload: { key: 'deleting', value: true } });

    try {
      // Delete customer
      await deleteDoc(doc(db, 'customers', customerId));

      // Delete all transactions for this customer
      const batch = writeBatch(db);
      const customerTransactions = state.transactions.filter(t => t.customerId === customerId);
      
      customerTransactions.forEach(transaction => {
        batch.delete(doc(db, 'transactions', transaction.id));
      });

      await batch.commit();

      dispatch({ type: actionTypes.DELETE_CUSTOMER, payload: customerId });
      message.success('Customer deleted successfully');
    } catch (error) {
      console.error('Error deleting customer:', error);
      message.error('Failed to delete customer');
      dispatch({ type: actionTypes.SET_LOADING, payload: { key: 'deleting', value: false } });
      throw error;
    }
  };

  // Add transaction
  const addTransaction = async (transactionData) => {
    if (!currentUser) return;

    dispatch({ type: actionTypes.SET_LOADING, payload: { key: 'adding', value: true } });

    try {
      const docRef = await addDoc(collection(db, 'transactions'), {
        ...transactionData,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Update customer statistics
      if (transactionData.customerId) {
        const customerRef = doc(db, 'customers', transactionData.customerId);
        await updateDoc(customerRef, {
          totalAmount: increment(transactionData.amount || 0),
          [transactionData.status === 'completed' ? 'completedAmount' : 'pendingAmount']: increment(transactionData.amount || 0),
          transactionCount: increment(1),
          updatedAt: serverTimestamp()
        });
      }

      const newTransaction = {
        id: docRef.id,
        ...transactionData,
        userId: currentUser.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      dispatch({ type: actionTypes.ADD_TRANSACTION, payload: newTransaction });
      message.success('Transaction added successfully');
      return newTransaction;
    } catch (error) {
      console.error('Error adding transaction:', error);
      message.error('Failed to add transaction');
      dispatch({ type: actionTypes.SET_LOADING, payload: { key: 'adding', value: false } });
      throw error;
    }
  };

  // Update transaction
  const updateTransaction = async (transactionId, updates) => {
    if (!currentUser) return;

    dispatch({ type: actionTypes.SET_LOADING, payload: { key: 'updating', value: true } });

    try {
      const transactionRef = doc(db, 'transactions', transactionId);
      await updateDoc(transactionRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      const updatedTransaction = {
        ...state.transactions.find(t => t.id === transactionId),
        ...updates,
        updatedAt: new Date()
      };

      dispatch({ type: actionTypes.UPDATE_TRANSACTION, payload: updatedTransaction });
      message.success('Transaction updated successfully');
      return updatedTransaction;
    } catch (error) {
      console.error('Error updating transaction:', error);
      message.error('Failed to update transaction');
      dispatch({ type: actionTypes.SET_LOADING, payload: { key: 'updating', value: false } });
      throw error;
    }
  };

  // Delete transaction
  const deleteTransaction = async (transactionId) => {
    if (!currentUser) return;

    dispatch({ type: actionTypes.SET_LOADING, payload: { key: 'deleting', value: true } });

    try {
      await deleteDoc(doc(db, 'transactions', transactionId));

      dispatch({ type: actionTypes.DELETE_TRANSACTION, payload: transactionId });
      message.success('Transaction deleted successfully');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      message.error('Failed to delete transaction');
      dispatch({ type: actionTypes.SET_LOADING, payload: { key: 'deleting', value: false } });
      throw error;
    }
  };

  // Set filters
  const setFilters = (filters) => {
    dispatch({ type: actionTypes.SET_FILTERS, payload: filters });
  };

  // Set sort
  const setSort = (sortBy, sortOrder) => {
    dispatch({ type: actionTypes.SET_SORT, payload: { sortBy, sortOrder } });
  };

  // Get filtered and sorted transactions
  const getFilteredTransactions = () => {
    const filtered = filterTransactions(state.transactions, state.filters);
    return sortTransactions(filtered, state.sortBy, state.sortOrder);
  };

  // Get customer by ID
  const getCustomerById = (customerId) => {
    return state.customers.find(customer => customer.id === customerId);
  };

  // Get transactions for a customer
  const getCustomerTransactions = (customerId) => {
    return state.transactions.filter(transaction => transaction.customerId === customerId);
  };

  // Generate report
  const generateReport = () => {
    return generateReportData(state.transactions, state.customers);
  };

  // Reset state (for logout)
  const resetState = () => {
    dispatch({ type: actionTypes.RESET_STATE });
  };

  // Load data when user changes
  useEffect(() => {
    if (currentUser) {
      const unsubscribeCustomers = loadCustomers();
      const unsubscribeTransactions = loadTransactions();

      return () => {
        unsubscribeCustomers?.();
        unsubscribeTransactions?.();
      };
    } else {
      resetState();
    }
  }, [currentUser, loadCustomers, loadTransactions]);

  // Update stats when data changes
  useEffect(() => {
    updateStats();
  }, [state.customers, state.transactions, updateStats]);

  const value = {
    // State
    ...state,
    
    // Actions
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    setFilters,
    setSort,
    
    // Getters
    getFilteredTransactions,
    getCustomerById,
    getCustomerTransactions,
    generateReport,
    
    // Utilities
    resetState
  };

  return (
    <KhataContext.Provider value={value}>
      {children}
    </KhataContext.Provider>
  );
};

// Custom hook to use the context
export const useKhata = () => {
  const context = useContext(KhataContext);
  if (!context) {
    throw new Error('useKhata must be used within a KhataProvider');
  }
  return context;
};

export default KhataContext;