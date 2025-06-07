import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { Expense } from '../types';
import { formatDate } from './date';

// Convert expenses array to CSV string
export const convertToCSV = (expenses: Expense[]): string => {
  // Define CSV headers
  const headers = ['Date', 'Category', 'Amount', 'Description'];
  
  // Create CSV content starting with headers
  let csvContent = headers.join(',') + '\n';
  
  // Add each expense as a row
  expenses.forEach((expense) => {
    const row = [
      formatDate(expense.date),
      expense.category,
      expense.amount.toFixed(2),
      `"${expense.description.replace(/"/g, '""')}"` // Escape quotes in description
    ];
    csvContent += row.join(',') + '\n';
  });
  
  return csvContent;
};

// Export expenses as CSV file
export const exportToCSV = async (expenses: Expense[]): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') {
      // For web platform, create a downloadable link
      const csvContent = convertToCSV(expenses);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Get current date for filename
      const date = new Date();
      const fileName = `expenses_${date.getFullYear()}_${date.getMonth() + 1}_${date.getDate()}.csv`;
      
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
      return true;
    } else {
      // For native platforms, use FileSystem and Sharing
      const csvContent = convertToCSV(expenses);
      
      // Get the app's document directory
      const fileUri = FileSystem.documentDirectory + 'expenses.csv';
      
      // Write the CSV content to a file
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8
      });
      
      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Expenses',
          UTI: 'public.comma-separated-values-text'
        });
        return true;
      } else {
        console.error('Sharing is not available on this platform');
        return false;
      }
    }
  } catch (error) {
    console.error('Error exporting expenses to CSV:', error);
    return false;
  }
};