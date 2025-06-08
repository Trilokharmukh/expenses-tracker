import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

export interface ExpenseDocument {
  _id: string;
  userId: string;
  amount: number;
  category: string;
  description: string;
  date: Date;
  isSynced?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
