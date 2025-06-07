import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  Alert,
  FlatList,
} from 'react-native';
import { useExpenses } from '../../context/ExpenseContext';
import ExpenseChart from '../../components/ExpenseChart';
import ExpenseFilter from '../../components/ExpenseFilter';
import ExpenseList from '../../components/ExpenseList';
import { exportToCSV } from '../../utils/csv';
import {
  getCurrentMonthDates,
  getFirstDayOfMonth,
  getLastDayOfMonth,
  getMonthName,
} from '../../utils/date';
import {
  getExpensesInDateRange,
  getExpenseSummary,
} from '../../utils/expenses';
import {
  CloudDownload as DownloadCloud,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react-native';

export default function ReportsScreen() {
  const { expenses, categories, filterOptions, filterExpenses } = useExpenses();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [filteredExpenses, setFilteredExpenses] = useState(expenses);
  const [isExporting, setIsExporting] = useState(false);

  // Get month data
  const currentMonthName = getMonthName(selectedMonth.getMonth());
  const currentYear = selectedMonth.getFullYear();

  // Get date range for the selected month
  const firstDay = getFirstDayOfMonth(selectedMonth);
  const lastDay = getLastDayOfMonth(selectedMonth);
  const monthDateRange = {
    startDate: firstDay.toISOString(),
    endDate: lastDay.toISOString(),
  };

  // Filter expenses for the selected month
  const monthlyExpenses = getExpensesInDateRange(expenses, monthDateRange);

  useEffect(() => {
    // Apply any additional filters from the filter component
    const allFilters = {
      ...filterOptions,
      dateRange: monthDateRange,
    };

    setFilteredExpenses(filterExpenses(allFilters));
  }, [expenses, filterOptions, selectedMonth]);

  // Calculate monthly summary
  const monthlySummary = getExpenseSummary(monthlyExpenses, 'month');

  const handlePreviousMonth = () => {
    setSelectedMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    const now = new Date();
    // Don't allow selecting future months
    if (
      selectedMonth.getMonth() === now.getMonth() &&
      selectedMonth.getFullYear() === now.getFullYear()
    ) {
      return;
    }

    setSelectedMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      await exportToCSV(monthlyExpenses);
      Alert.alert('Success', 'Expenses exported successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to export expenses. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>Expense Reports</Text>

        <TouchableOpacity
          style={styles.exportButton}
          onPress={handleExportCSV}
          disabled={isExporting || monthlyExpenses.length === 0}
        >
          {isExporting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <DownloadCloud size={18} color="#fff" style={styles.exportIcon} />
              <Text style={styles.exportText}>Export CSV</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={handlePreviousMonth}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {currentMonthName} {currentYear}
        </Text>
        <TouchableOpacity onPress={handleNextMonth}>
          <ArrowRight size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.chartContainer}>
        <ExpenseChart
          expenses={monthlyExpenses}
          categories={categories}
          type={'pie'}
        />
      </View>

      <View style={styles.expensesListContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Monthly Transactions</Text>
        </View>

        <ExpenseFilter />
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <FlatList
          data={filteredExpenses}
          renderItem={({ item }) => <ExpenseList expenses={[item]} />}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No expenses for this period</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#06B6D4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  exportIcon: {
    marginRight: 6,
  },
  exportText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 16,
  },
  arrowButton: {
    padding: 8,
  },
  disabledArrowButton: {
    opacity: 0.5,
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 16,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  categoryStats: {
    marginTop: 8,
  },
  categoryStat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 14,
    color: '#333',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  chartContainer: {
    marginBottom: 16,
  },
  expensesListContainer: {
    marginBottom: 16,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  emptyContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
