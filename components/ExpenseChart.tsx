import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { Expense, Category } from '../types';
import { getMonthlyTotals } from '../utils/expenses';

type ExpenseChartProps = {
  expenses: Expense[];
  categories: Category[];
  type: 'line' | 'pie';
};

const ExpenseChart: React.FC<ExpenseChartProps> = ({
  expenses,
  categories,
  type,
}) => {
  const screenWidth = Dimensions.get('window').width - 32; // Account for padding

  if (expenses.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No data available for chart</Text>
      </View>
    );
  }

  if (type === 'line') {
    const monthlyData = getMonthlyTotals(expenses);
    
    const monthLabels = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const data = {
      labels: monthLabels,
      datasets: [
        {
          data: monthlyData,
          color: (opacity = 1) => `rgba(6, 182, 212, ${opacity})`, // Teal
          strokeWidth: 2,
        },
      ],
    };

    const chartConfig = {
      backgroundColor: '#fff',
      backgroundGradientFrom: '#fff',
      backgroundGradientTo: '#fff',
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      style: {
        borderRadius: 16,
      },
      propsForDots: {
        r: '4',
        strokeWidth: '2',
        stroke: '#06B6D4',
      },
    };

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Monthly Expenses</Text>
        <LineChart
          data={data}
          width={screenWidth}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>
    );
  } else if (type === 'pie') {
    // Aggregate expenses by category
    const expensesByCategory: { [category: string]: number } = {};
    expenses.forEach(expense => {
      if (!expensesByCategory[expense.category]) {
        expensesByCategory[expense.category] = 0;
      }
      expensesByCategory[expense.category] += expense.amount;
    });

    // Convert to pie chart data format
    const pieData = Object.entries(expensesByCategory).map(([name, amount]) => {
      const category = categories.find(cat => cat.name === name);
      return {
        name,
        value: amount,
        color: category?.color || '#6B7280',
        legendFontColor: '#7F7F7F',
        legendFontSize: 12,
      };
    });

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Expenses by Category</Text>
        <PieChart
          data={pieData}
          width={screenWidth}
          height={220}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="value"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  emptyContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});

export default ExpenseChart;