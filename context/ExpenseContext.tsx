import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { Expense, Category, ExpenseFilterOptions } from '../types';
import {
  getExpenses,
  getCategories,
  DEFAULT_CATEGORIES,
} from '../utils/storage';
import { Alert } from 'react-native';

// Configure axios base URL

axios.defaults.baseURL = 'https://expenses-tracker-km9q.onrender.com';

interface ExpenseContextType {
  expenses: Expense[];
  categories: Category[];
  addExpense: (expense: Omit<Expense, 'id' | 'isSynced'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  syncExpenses: () => Promise<void>;
  isOnline: boolean;
  filterOptions: ExpenseFilterOptions;
  setFilterOptions: React.Dispatch<React.SetStateAction<ExpenseFilterOptions>>;
  clearFilters: () => void;
  filterExpenses: (options: ExpenseFilterOptions) => Expense[];
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [isOnline, setIsOnline] = useState(true);
  const [filterOptions, setFilterOptions] = useState<ExpenseFilterOptions>({});
  const { user, token } = useAuth();

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load expenses from AsyncStorage and sync with server
  useEffect(() => {
    if (user && token) {
      loadAndSyncExpenses();
    } else {
      loadExpenses();
    }
  }, [user, token]);

  // Monitor network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? false);
      if (state.isConnected && user && token) {
        syncExpenses();
      }
    });

    return () => unsubscribe();
  }, [user, token]);

  const loadExpenses = async () => {
    try {
      const storedExpenses = await getExpenses();
      setExpenses(storedExpenses);
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  };

  const loadAndSyncExpenses = async () => {
    try {
      await loadExpenses();
      await syncExpenses();
    } catch (error) {
      console.error('Error loading and syncing expenses:', error);
    }
  };

  const saveExpenses = async (updatedExpenses: Expense[]) => {
    try {
      await AsyncStorage.setItem('expenses', JSON.stringify(updatedExpenses));
      setExpenses(updatedExpenses);
    } catch (error) {
      console.error('Error saving expenses:', error);
    }
  };

  const checkInternetConnection = async () => {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      Alert.alert(
        'No Internet Connection',
        'Please check your internet connection and try again.'
      );
      return false;
    }
    return true;
  };

  const addExpense = async (expense: Omit<Expense, 'id' | 'isSynced'>) => {
    const isConnected = await checkInternetConnection();
    if (!isConnected) return;

    try {
      const response = await axios.post('/api/expenses', {
        ...expense,
        userId: user.id,
      });
      const newExpense = response.data;
      setExpenses((prev) => [...prev, newExpense]);
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  };

  const deleteExpense = async (id: string) => {
    const updatedExpenses = expenses.filter((expense) => expense.id !== id);
    await saveExpenses(updatedExpenses);

    if (isOnline && user && token) {
      try {
        await axios.delete(`/api/expenses/${id}`);
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const syncExpenses = async () => {
    if (!isOnline || !user || !token) return;

    try {
      // Get all unsynced expenses
      const unsyncedExpenses = expenses.filter((expense) => !expense.isSynced);

      // Sync each unsynced expense
      for (const expense of unsyncedExpenses) {
        try {
          const response = await axios.post('/api/expenses', {
            ...expense,
            userId: user.id,
          });

          // Update local expense with server data
          const updatedExpenses = expenses.map((e) =>
            e.id === expense.id
              ? { ...e, id: response.data._id, isSynced: true }
              : e
          );
          await saveExpenses(updatedExpenses);
        } catch (error) {
          console.error('Error syncing expense:', error);
        }
      }

      // Fetch latest expenses from server
      const response = await axios.get('/api/expenses');
      const serverExpenses = response.data.map((expense: any) => ({
        ...expense,
        id: expense._id,
        isSynced: true,
      }));

      // Merge local and server expenses
      const mergedExpenses = [...serverExpenses];
      const localUnsynced = expenses.filter((e) => !e.isSynced);
      mergedExpenses.push(...localUnsynced);

      await saveExpenses(mergedExpenses);
    } catch (error) {
      console.error('Error syncing expenses:', error);
    }
  };

  const clearFilters = () => {
    setFilterOptions({});
  };

  const filterExpenses = (options: ExpenseFilterOptions): Expense[] => {
    return expenses.filter((expense) => {
      // Search query filter
      if (options.searchQuery) {
        const searchLower = options.searchQuery.toLowerCase();
        const matchesSearch =
          expense.description.toLowerCase().includes(searchLower) ||
          expense.category.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Date range filter
      if (options.startDate || options.endDate) {
        const expenseDate = new Date(expense.date);
        if (options.startDate && expenseDate < options.startDate) return false;
        if (options.endDate && expenseDate > options.endDate) return false;
      }

      // Categories filter
      if (options.categories && options.categories.length > 0) {
        if (!options.categories.includes(expense.category)) return false;
      }

      return true;
    });
  };

  const value = {
    expenses,
    categories,
    addExpense,
    deleteExpense,
    syncExpenses,
    isOnline,
    filterOptions,
    setFilterOptions,
    clearFilters,
    filterExpenses,
  };

  return (
    <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};
