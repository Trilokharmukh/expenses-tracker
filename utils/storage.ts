import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense, Category } from '../types';

// Keys for AsyncStorage
const EXPENSES_STORAGE_KEY = 'expenses';
const CATEGORIES_STORAGE_KEY = 'categories';

// Default categories
export const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Food', color: '#F97316', icon: 'utensils' },
  { id: '2', name: 'Transportation', color: '#3B82F6', icon: 'car' },
  { id: '3', name: 'Housing', color: '#10B981', icon: 'home' },
  { id: '4', name: 'Entertainment', color: '#8B5CF6', icon: 'tv' },
  { id: '5', name: 'Shopping', color: '#EC4899', icon: 'shopping-bag' },
  { id: '6', name: 'Health', color: '#06B6D4', icon: 'heart' },
  { id: '7', name: 'Utilities', color: '#EAB308', icon: 'zap' },
  { id: '8', name: 'Other', color: '#6B7280', icon: 'more-horizontal' },
];

// Get all expenses
export const getExpenses = async (): Promise<Expense[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(EXPENSES_STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Failed to load expenses', e);
    return [];
  }
};

// Save an expense
export const saveExpense = async (expense: Expense): Promise<void> => {
  try {
    const expenses = await getExpenses();
    expenses.push(expense);
    await AsyncStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
  } catch (e) {
    console.error('Failed to save expense', e);
  }
};

// Update an expense
export const updateExpense = async (updatedExpense: Expense): Promise<void> => {
  try {
    const expenses = await getExpenses();
    const index = expenses.findIndex((exp) => exp.id === updatedExpense.id);
    if (index !== -1) {
      expenses[index] = updatedExpense;
      await AsyncStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
    }
  } catch (e) {
    console.error('Failed to update expense', e);
  }
};

// Delete an expense
export const deleteExpense = async (id: string): Promise<void> => {
  try {
    const expenses = await getExpenses();
    const filteredExpenses = expenses.filter((exp) => exp.id !== id);
    await AsyncStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(filteredExpenses));
  } catch (e) {
    console.error('Failed to delete expense', e);
  }
};

// Get all categories
export const getCategories = async (): Promise<Category[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (jsonValue != null) {
      return JSON.parse(jsonValue);
    } else {
      // Initialize with default categories
      await AsyncStorage.setItem(
        CATEGORIES_STORAGE_KEY,
        JSON.stringify(DEFAULT_CATEGORIES)
      );
      return DEFAULT_CATEGORIES;
    }
  } catch (e) {
    console.error('Failed to load categories', e);
    return DEFAULT_CATEGORIES;
  }
};

// Save a category
export const saveCategory = async (category: Category): Promise<void> => {
  try {
    const categories = await getCategories();
    categories.push(category);
    await AsyncStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  } catch (e) {
    console.error('Failed to save category', e);
  }
};

// Clear all data (for testing)
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([EXPENSES_STORAGE_KEY, CATEGORIES_STORAGE_KEY]);
  } catch (e) {
    console.error('Failed to clear data', e);
  }
};