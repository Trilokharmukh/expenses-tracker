export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string;
  description: string;
  userId?: string;
  isSynced?: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface ExpenseFilterOptions {
  searchQuery?: string;
  startDate?: Date;
  endDate?: Date;
  categories?: string[];
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  minAmount?: number;
  maxAmount?: number;
}

export interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

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
