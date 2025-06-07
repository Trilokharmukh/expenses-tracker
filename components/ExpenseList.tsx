import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Expense } from '../types';
import { formatDate } from '../utils/date';
import { Trash2 } from 'lucide-react-native';
import { useExpenses } from '../context/ExpenseContext';

type ExpenseListProps = {
  expenses: Expense[];
  onExpensePress?: (expense: Expense) => void;
};

const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  onExpensePress,
}) => {
  const { deleteExpense, categories } = useExpenses();

  const getCategoryColor = (categoryName: string): string => {
    const category = categories.find(cat => cat.name === categoryName);
    return category?.color || '#6B7280'; // Default gray if category not found
  };

  // Group expenses by date
  const groupedExpenses: { [date: string]: Expense[] } = {};
  expenses.forEach(expense => {
    const dateKey = expense.date.split('T')[0]; // Get YYYY-MM-DD
    if (!groupedExpenses[dateKey]) {
      groupedExpenses[dateKey] = [];
    }
    groupedExpenses[dateKey].push(expense);
  });

  // Convert grouped expenses to array for FlatList
  const groupedExpensesArray = Object.entries(groupedExpenses)
    .map(([date, exps]) => ({
      date,
      expenses: exps,
      totalForDay: exps.reduce((sum, exp) => sum + exp.amount, 0),
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleDelete = (id: string) => {
    deleteExpense(id);
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <TouchableOpacity 
      style={styles.expenseItem}
      onPress={() => onExpensePress && onExpensePress(item)}
    >
      <View style={styles.expenseContent}>
        <View style={styles.expenseLeft}>
          <View 
            style={[
              styles.categoryIndicator, 
              { backgroundColor: getCategoryColor(item.category) }
            ]} 
          />
          <View style={styles.expenseDetails}>
            <Text style={styles.expenseDescription}>{item.description}</Text>
            <Text style={styles.expenseCategory}>{item.category}</Text>
          </View>
        </View>
        <View style={styles.expenseRight}>
          <Text style={styles.expenseAmount}>₹{item.amount.toFixed(2)}</Text>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleDelete(item.id)}
          >
            <Trash2 size={16} color="#FF4040" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderDateGroup = ({ item }: { item: typeof groupedExpensesArray[0] }) => (
    <View style={styles.dateGroup}>
      <View style={styles.dateHeader}>
        <Text style={styles.dateText}>{formatDate(item.date)}</Text>
        <Text style={styles.dateTotalText}>₹{item.totalForDay.toFixed(2)}</Text>
      </View>
      {item.expenses.map(expense => (
        <React.Fragment key={expense.id}>
          {renderExpenseItem({ item: expense })}
        </React.Fragment>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {expenses.length > 0 ? (
        <FlatList
          data={groupedExpensesArray}
          renderItem={renderDateGroup}
          keyExtractor={item => item.date}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No expenses to show</Text>
          <Text style={styles.emptySubtext}>
            Add your first expense using the plus button below
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dateGroup: {
    marginBottom: 16,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  dateText: {
    fontWeight: '600',
    color: '#666',
  },
  dateTotalText: {
    fontWeight: '700',
    color: '#333',
  },
  expenseItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  expenseContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: 12,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseDescription: {
    fontWeight: '500',
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  expenseCategory: {
    color: '#666',
    fontSize: 14,
  },
  expenseRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expenseAmount: {
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
    marginRight: 12,
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default ExpenseList;