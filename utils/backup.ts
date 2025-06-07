import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Expense, Category } from '../types';

// Keys for AsyncStorage
const EXPENSES_STORAGE_KEY = 'expenses';
const CATEGORIES_STORAGE_KEY = 'categories';

export interface BackupData {
  expenses: Expense[];
  categories: Category[];
  backupDate: string;
  version: string;
}

export const createBackup = async (): Promise<string> => {
  try {
    // Get all expenses and categories
    const expensesJson = await AsyncStorage.getItem(EXPENSES_STORAGE_KEY);
    const categoriesJson = await AsyncStorage.getItem(CATEGORIES_STORAGE_KEY);

    const expenses = expensesJson ? JSON.parse(expensesJson) : [];
    const categories = categoriesJson ? JSON.parse(categoriesJson) : [];

    // Create backup data
    const backupData: BackupData = {
      expenses,
      categories,
      backupDate: new Date().toISOString(),
      version: '1.0.0', // App version
    };

    // Create backup directory if it doesn't exist
    const backupDir = `${FileSystem.documentDirectory}backups`;
    const dirInfo = await FileSystem.getInfoAsync(backupDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(backupDir, { intermediates: true });
    }

    // Create backup file
    const backupDate = new Date().toISOString().split('T')[0];
    const backupPath = `${backupDir}/expense-tracker-backup-${backupDate}.json`;
    await FileSystem.writeAsStringAsync(
      backupPath,
      JSON.stringify(backupData, null, 2)
    );

    return backupPath;
  } catch (error) {
    console.error('Failed to create backup:', error);
    throw new Error('Failed to create backup');
  }
};

export const getBackups = async (): Promise<string[]> => {
  try {
    const backupDir = `${FileSystem.documentDirectory}backups`;
    const dirInfo = await FileSystem.getInfoAsync(backupDir);

    if (!dirInfo.exists) {
      return [];
    }

    const files = await FileSystem.readDirectoryAsync(backupDir);
    return files
      .filter((file) => file.endsWith('.json'))
      .map((file) => `${backupDir}/${file}`);
  } catch (error) {
    console.error('Failed to get backups:', error);
    throw new Error('Failed to get backups');
  }
};

export const restoreFromBackup = async (backupPath: string): Promise<void> => {
  try {
    // Read backup file
    const backupContent = await FileSystem.readAsStringAsync(backupPath);
    const backupData: BackupData = JSON.parse(backupContent);

    // Validate backup data
    if (!backupData.expenses || !backupData.categories) {
      throw new Error('Invalid backup data');
    }

    // Restore expenses and categories
    await AsyncStorage.setItem(
      EXPENSES_STORAGE_KEY,
      JSON.stringify(backupData.expenses)
    );
    await AsyncStorage.setItem(
      CATEGORIES_STORAGE_KEY,
      JSON.stringify(backupData.categories)
    );

    return;
  } catch (error) {
    console.error('Failed to restore from backup:', error);
    throw new Error('Failed to restore from backup');
  }
};

export const deleteBackup = async (backupPath: string): Promise<void> => {
  try {
    await FileSystem.deleteAsync(backupPath);
  } catch (error) {
    console.error('Failed to delete backup:', error);
    throw new Error('Failed to delete backup');
  }
};
