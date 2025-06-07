import {
  Expense,
  ExpenseSummary,
  TimeFrame,
  ExpenseFilterOptions,
  DateRangeFilter,
} from '../types';
import {
  getCurrentMonthDates,
  getCurrentWeekDates,
  getCurrentYearDates,
  isDateInRange,
} from './date';

// Get expenses for a specific date range
export const getExpensesInDateRange = (
  expenses: Expense[],
  dateRange: DateRangeFilter
): Expense[] => {
  return expenses.filter((expense) =>
    isDateInRange(expense.date, dateRange.startDate, dateRange.endDate)
  );
};

// Filter expenses based on provided filter options
export const filterExpenses = (
  expenses: Expense[],
  filterOptions: ExpenseFilterOptions
): Expense[] => {
  return expenses.filter((expense) => {
    // Filter by categories
    if (
      filterOptions.categories &&
      filterOptions.categories.length > 0 &&
      !filterOptions.categories.includes(expense.category)
    ) {
      return false;
    }

    // Filter by date range
    if (
      filterOptions.dateRange &&
      !isDateInRange(
        expense.date,
        filterOptions.dateRange.startDate,
        filterOptions.dateRange.endDate
      )
    ) {
      return false;
    }

    // Filter by min amount
    if (
      filterOptions.minAmount !== undefined &&
      expense.amount < filterOptions.minAmount
    ) {
      return false;
    }

    // Filter by max amount
    if (
      filterOptions.maxAmount !== undefined &&
      expense.amount > filterOptions.maxAmount
    ) {
      return false;
    }

    // Filter by search query
    if (
      filterOptions.searchQuery &&
      !expense.description
        .toLowerCase()
        .includes(filterOptions.searchQuery.toLowerCase()) &&
      !expense.category
        .toLowerCase()
        .includes(filterOptions.searchQuery.toLowerCase())
    ) {
      return false;
    }

    return true;
  });
};

// Get summary of expenses for a specific time frame
export const getExpenseSummary = (
  expenses: Expense[],
  timeFrame: TimeFrame
): ExpenseSummary => {
  let filteredExpenses: Expense[] = [];

  // Filter expenses based on time frame
  switch (timeFrame) {
    case 'day':
      const today = new Date().toISOString().split('T')[0];
      filteredExpenses = expenses.filter(
        (expense) => expense.date.split('T')[0] === today
      );
      break;
    case 'week':
      const weekDates = getCurrentWeekDates();
      filteredExpenses = getExpensesInDateRange(expenses, weekDates);
      break;
    case 'month':
      const monthDates = getCurrentMonthDates();
      filteredExpenses = getExpensesInDateRange(expenses, monthDates);
      break;
    case 'year':
      const yearDates = getCurrentYearDates();
      filteredExpenses = getExpensesInDateRange(expenses, yearDates);
      break;
    default:
      filteredExpenses = expenses;
  }

  // Calculate total amount
  const totalAmount = filteredExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  // Calculate category breakdown
  const categoryBreakdown = filteredExpenses.reduce((breakdown, expense) => {
    const { category, amount } = expense;
    breakdown[category] = (breakdown[category] || 0) + amount;
    return breakdown;
  }, {} as { [category: string]: number });

  return {
    totalAmount,
    categoryBreakdown,
    timeFrame,
  };
};

// Get expenses grouped by day
export const getExpensesGroupedByDay = (
  expenses: Expense[]
): { [date: string]: Expense[] } => {
  return expenses.reduce((groups, expense) => {
    const date = expense.date.split('T')[0]; // Get YYYY-MM-DD
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(expense);
    return groups;
  }, {} as { [date: string]: Expense[] });
};

// Get expenses grouped by month
export const getExpensesGroupedByMonth = (
  expenses: Expense[]
): { [month: string]: Expense[] } => {
  return expenses.reduce((groups, expense) => {
    const date = new Date(expense.date);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      '0'
    )}`;
    if (!groups[month]) {
      groups[month] = [];
    }
    groups[month].push(expense);
    return groups;
  }, {} as { [month: string]: Expense[] });
};

// Get expenses grouped by category
export const getExpensesGroupedByCategory = (
  expenses: Expense[]
): { [category: string]: Expense[] } => {
  return expenses.reduce((groups, expense) => {
    const { category } = expense;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(expense);
    return groups;
  }, {} as { [category: string]: Expense[] });
};

// Get monthly totals for the current year
export const getMonthlyTotals = (expenses: Expense[]): number[] => {
  const currentYear = new Date().getFullYear();
  const monthlyTotals = Array(12).fill(0);

  expenses.forEach((expense) => {
    const expenseDate = new Date(expense.date);
    if (expenseDate.getFullYear() === currentYear) {
      const month = expenseDate.getMonth();
      monthlyTotals[month] += expense.amount;
    }
  });

  return monthlyTotals;
};
