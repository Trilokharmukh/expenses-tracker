import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  FlatList,
  ScrollView,
} from 'react-native';
import { useExpenses } from '../../context/ExpenseContext';
import ExpenseSummaryCard from '../../components/ExpenseSummaryCard';
import ExpenseList from '../../components/ExpenseList';
import ExpenseFilter from '../../components/ExpenseFilter';
import { getExpenseSummary } from '../../utils/expenses';
import { getCurrentMonthDates, getMonthName } from '../../utils/date';
import { formatCurrency } from '../../utils/format';
import { getExpensesInDateRange } from '../../utils/expenses';

export default function DashboardScreen() {
  const { expenses, filterOptions, filterExpenses } = useExpenses();
  const [refreshing, setRefreshing] = useState(false);
  const [filteredExpenses, setFilteredExpenses] = useState(expenses);
  const { startDate, endDate } = getCurrentMonthDates();
  const monthlyExpenses = getExpensesInDateRange(expenses, {
    startDate,
    endDate,
  });

  // Get current month name and year
  const currentDate = new Date();
  const currentMonth = getMonthName(currentDate.getMonth());
  const currentYear = currentDate.getFullYear();

  // Calculate expense summaries
  const dailySummary = getExpenseSummary(expenses, 'day');
  const weeklySummary = getExpenseSummary(expenses, 'week');
  const monthlySummary = getExpenseSummary(expenses, 'month');
  const yearlySummary = getExpenseSummary(expenses, 'year');

  const totalExpenses = monthlyExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  useEffect(() => {
    // Apply filters whenever expenses or filter options change
    const filtered = filterExpenses(filterOptions);
    setFilteredExpenses(filtered);
  }, [expenses, filterOptions, filterExpenses]);

  const onRefresh = async () => {
    setRefreshing(true);
    // In a real app, you might re-fetch data from an API here
    // For now, we'll just simulate a refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.title}>Financial Summary</Text>
        </View>
        <View style={styles.monthBadge}>
          <Text style={styles.monthText}>
            {currentMonth} {currentYear}
          </Text>
        </View>
      </View>

      <View style={styles.summaryContainer}>
        <ExpenseSummaryCard
          summary={monthlySummary}
          title={`This Month (${currentMonth})`}
        />
      </View>

      <View style={styles.quickStats}>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>Today</Text>
          <Text style={styles.statValue}>
            {formatCurrency(dailySummary.totalAmount.toFixed(2))}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>This Week</Text>
          <Text style={styles.statValue}>
            {formatCurrency(weeklySummary.totalAmount.toFixed(2))}
          </Text>
        </View>
        <View style={styles.statCardYear}>
          <Text style={styles.statTitle}>This Year</Text>
          <Text style={styles.statValue}>
            {formatCurrency(yearlySummary.totalAmount.toFixed(2))}
          </Text>
        </View>
      </View>

      <View style={styles.recentExpenses}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Expenses</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <ExpenseFilter />
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <FlatList
          data={filteredExpenses.slice(0, 10)}
          renderItem={({ item }) => (
            <ExpenseList
              expenses={[item]}
              onExpensePress={(expense) => {
                // Handle expense press
                console.log('Expense pressed:', expense);
              }}
            />
          )}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  summaryCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  summarySubtitle: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  monthBadge: {
    backgroundColor: '#06B6D4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  monthText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  summaryContainer: {
    marginBottom: 16,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: '47%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statCardYear: {
    marginTop: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  recentExpenses: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#06B6D4',
    fontWeight: '500',
  },
});
