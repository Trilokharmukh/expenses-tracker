import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useExpenses } from '../context/ExpenseContext';
import { formatCurrency } from '../utils/format';
import { getMonthName } from '../utils/date';

interface MonthlyReportProps {
  currentMonth: number;
  currentYear: number;
}

export default function MonthlyReport({
  currentMonth,
  currentYear,
}: MonthlyReportProps) {
  const { expenses } = useExpenses();

  const monthlyData = React.useMemo(() => {
    const monthExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return (
        expenseDate.getMonth() === currentMonth &&
        expenseDate.getFullYear() === currentYear
      );
    });

    const total = monthExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const categoryTotals = monthExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      count: monthExpenses.length,
      categoryTotals,
    };
  }, [expenses, currentMonth, currentYear]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.monthTitle}>
          {getMonthName(currentMonth)} {currentYear}
        </Text>
        <Text style={styles.total}>
          Total: {formatCurrency(monthlyData.total)}
        </Text>
        <Text style={styles.count}>{monthlyData.count} expenses</Text>
      </View>

      <View style={styles.categorySection}>
        <Text style={styles.sectionTitle}>Category Breakdown</Text>
        {Object.entries(monthlyData.categoryTotals)
          .sort(([, a], [, b]) => b - a)
          .map(([category, total]) => (
            <View key={category} style={styles.categoryRow}>
              <Text style={styles.categoryName}>{category}</Text>
              <Text style={styles.categoryAmount}>{formatCurrency(total)}</Text>
            </View>
          ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    marginBottom: 20,
  },
  monthTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  total: {
    fontSize: 20,
    color: '#007AFF',
    marginBottom: 4,
  },
  count: {
    fontSize: 16,
    color: '#666',
  },
  categorySection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryName: {
    fontSize: 16,
    color: '#333',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
  },
});
