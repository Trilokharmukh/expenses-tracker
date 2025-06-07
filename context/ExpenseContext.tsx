import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense, Category, ExpenseFilterOptions } from '../types';
import { getExpenses, getCategories, DEFAULT_CATEGORIES } from '../utils/storage';

type ExpenseContextType = {
  expenses: Expense[];
  categories: Category[];
  isLoading: boolean;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>;
  updateExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  filterExpenses: (options: ExpenseFilterOptions) => Expense[];
  clearFilters: () => void;
  filterOptions: ExpenseFilterOptions;
  setFilterOptions: React.Dispatch<React.SetStateAction<ExpenseFilterOptions>>;
};

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState<ExpenseFilterOptions>({});

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Load expenses
        const storedExpenses = await getExpenses();
        setExpenses(storedExpenses);

        // Load or initialize categories
        const storedCategories = await getCategories();
        if (storedCategories.length === 0) {
          await AsyncStorage.setItem(
            'categories',
            JSON.stringify(DEFAULT_CATEGORIES)
          );
          setCategories(DEFAULT_CATEGORIES);
        } else {
          setCategories(storedCategories);
        }
      } catch (error) {
        console.error('Failed to initialize data', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  // Add a new expense
  const addExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    try {
      const newExpense: Expense = {
        ...expenseData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };

      const updatedExpenses = [...expenses, newExpense];
      setExpenses(updatedExpenses);
      await AsyncStorage.setItem('expenses', JSON.stringify(updatedExpenses));
    } catch (error) {
      console.error('Failed to add expense', error);
    }
  };

  // Update an existing expense
  const updateExpense = async (updatedExpense: Expense) => {
    try {
      const updatedExpenses = expenses.map((exp) =>
        exp.id === updatedExpense.id ? updatedExpense : exp
      );
      setExpenses(updatedExpenses);
      await AsyncStorage.setItem('expenses', JSON.stringify(updatedExpenses));
    } catch (error) {
      console.error('Failed to update expense', error);
    }
  };

  // Delete an expense
  const deleteExpense = async (id: string) => {
    try {
      const updatedExpenses = expenses.filter((exp) => exp.id !== id);
      setExpenses(updatedExpenses);
      await AsyncStorage.setItem('expenses', JSON.stringify(updatedExpenses));
    } catch (error) {
      console.error('Failed to delete expense', error);
    }
  };

  // Add a new category
  const addCategory = async (categoryData: Omit<Category, 'id'>) => {
    try {
      const newCategory: Category = {
        ...categoryData,
        id: Date.now().toString(),
      };

      const updatedCategories = [...categories, newCategory];
      setCategories(updatedCategories);
      await AsyncStorage.setItem('categories', JSON.stringify(updatedCategories));
    } catch (error) {
      console.error('Failed to add category', error);
    }
  };

  // Filter expenses based on provided options
  const filterExpenses = (options: ExpenseFilterOptions): Expense[] => {
    return expenses.filter((expense) => {
      // Filter by categories
      if (
        options.categories &&
        options.categories.length > 0 &&
        !options.categories.includes(expense.category)
      ) {
        return false;
      }

      // Filter by date range
      if (
        options.dateRange &&
        (new Date(expense.date) < new Date(options.dateRange.startDate) ||
          new Date(expense.date) > new Date(options.dateRange.endDate))
      ) {
        return false;
      }

      // Filter by min amount
      if (
        options.minAmount !== undefined &&
        expense.amount < options.minAmount
      ) {
        return false;
      }

      // Filter by max amount
      if (
        options.maxAmount !== undefined &&
        expense.amount > options.maxAmount
      ) {
        return false;
      }

      // Filter by search query
      if (
        options.searchQuery &&
        !expense.description
          .toLowerCase()
          .includes(options.searchQuery.toLowerCase()) &&
        !expense.category
          .toLowerCase()
          .includes(options.searchQuery.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilterOptions({});
  };

  const value = {
    expenses,
    categories,
    isLoading,
    addExpense,
    updateExpense,
    deleteExpense,
    addCategory,
    filterExpenses,
    clearFilters,
    filterOptions,
    setFilterOptions,
  };

  return (
    <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>
  );
};

// Custom hook to use the Expense context
export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};