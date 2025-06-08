import express, { Response, Router, NextFunction } from 'express';
import { Expense } from './../models/Expense';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { AuthRequest, ExpenseDocument } from '../types';

const router: Router = express.Router();

// Middleware to verify JWT token
const auth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as { userId: string };

    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get all expenses for a user
router.get(
  '/',
  auth,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const expenses = await Expense.find({
        userId: new mongoose.Types.ObjectId(req.user?.userId),
      }).sort({ date: -1 });
      res.json(expenses);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get expenses by date range
router.get(
  '/range',
  auth,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res
          .status(400)
          .json({ message: 'Start date and end date are required' });
        return;
      }

      const expenses = await Expense.find({
        userId: new mongoose.Types.ObjectId(req.user?.userId),
        date: {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string),
        },
      }).sort({ date: -1 });

      res.json(expenses);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get expenses by category
router.get(
  '/category/:category',
  auth,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const expenses = await Expense.find({
        userId: new mongoose.Types.ObjectId(req.user?.userId),
        category: req.params.category,
      }).sort({ date: -1 });

      res.json(expenses);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Add a new expense
router.post(
  '/',
  auth,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { amount, category, description, date } = req.body;

      if (!amount || !category || !description || !date) {
        res.status(400).json({ message: 'All fields are required' });
        return;
      }

      const expense = new Expense({
        userId: new mongoose.Types.ObjectId(req.user?.userId),
        amount,
        category,
        description,
        date: new Date(date),
        isSynced: true,
      });

      await expense.save();
      res.status(201).json(expense);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update an expense
router.put(
  '/:id',
  auth,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { amount, category, description, date } = req.body;

      const expense = await Expense.findOne({
        _id: req.params.id,
        userId: new mongoose.Types.ObjectId(req.user?.userId),
      });

      if (!expense) {
        res.status(404).json({ message: 'Expense not found' });
        return;
      }

      expense.amount = amount || expense.amount;
      expense.category = category || expense.category;
      expense.description = description || expense.description;
      expense.date = date ? new Date(date) : expense.date;

      await expense.save();
      res.json(expense);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete an expense
router.delete(
  '/:id',
  auth,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const expense = await Expense.findOne({
        _id: req.params.id,
        userId: new mongoose.Types.ObjectId(req.user?.userId),
      });

      if (!expense) {
        res.status(404).json({ message: 'Expense not found' });
        return;
      }

      await expense.deleteOne();
      res.json({ message: 'Expense deleted' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get expense summary
router.get(
  '/summary',
  auth,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { timeFrame } = req.query;
      const userId = new mongoose.Types.ObjectId(req.user?.userId);

      let startDate: Date;
      const endDate = new Date();

      switch (timeFrame) {
        case 'day':
          startDate = new Date();
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate = new Date();
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          startDate = new Date();
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate = new Date(0); // Beginning of time
      }

      const expenses = await Expense.find({
        userId,
        date: { $gte: startDate, $lte: endDate },
      });

      const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const categoryBreakdown = expenses.reduce((breakdown, exp) => {
        breakdown[exp.category] = (breakdown[exp.category] || 0) + exp.amount;
        return breakdown;
      }, {} as { [category: string]: number });

      res.json({
        totalAmount,
        categoryBreakdown,
        timeFrame,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router;
