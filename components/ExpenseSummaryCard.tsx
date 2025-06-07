import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ExpenseSummary, TimeFrame } from '../types';

type ExpenseSummaryCardProps = {
  summary: ExpenseSummary;
  title: string;
};

const ExpenseSummaryCard: React.FC<ExpenseSummaryCardProps> = ({
  summary,
  title,
}) => {
  // Calculate top categories
  const topCategories = Object.entries(summary.categoryBreakdown)
    .sort(([, amountA], [, amountB]) => amountB - amountA)
    .slice(0, 3); // Get top 3 categories

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.amountText}>₹{summary.totalAmount.toFixed(2)}</Text>

      {topCategories.length > 0 ? (
        <View style={styles.categoriesContainer}>
          <Text style={styles.categoriesTitle}>Top Categories:</Text>
          {topCategories.map(([category, amount]) => (
            <View key={category} style={styles.categoryRow}>
              <Text style={styles.categoryName}>{category}</Text>
              <Text style={styles.categoryAmount}>₹{amount.toFixed(2)}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.noExpensesText}>No expenses in this period</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  amountText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  categoriesContainer: {
    marginTop: 8,
  },
  categoriesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
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
  noExpensesText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 8,
  },
});

export default ExpenseSummaryCard;
