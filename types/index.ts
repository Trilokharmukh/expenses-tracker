export type Expense = {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string; // ISO string format
  createdAt: string; // ISO string format
};

export type Category = {
  id: string;
  name: string;
  color: string;
  icon: string;
};

export type TimeFrame = 'day' | 'week' | 'month' | 'year';

export type ExpenseSummary = {
  totalAmount: number;
  categoryBreakdown: {
    [category: string]: number;
  };
  timeFrame: TimeFrame;
};

export type DateRangeFilter = {
  startDate: string;
  endDate: string;
};

export type ExpenseFilterOptions = {
  categories?: string[];
  dateRange?: DateRangeFilter;
  minAmount?: number;
  maxAmount?: number;
  searchQuery?: string;
};