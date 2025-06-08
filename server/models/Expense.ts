import mongoose, { Document } from 'mongoose';

interface IExpense extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  category: string;
  description: string;
  date: Date;
  isSynced: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    isSynced: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Expense =
  mongoose.models.Expense || mongoose.model<IExpense>('Expense', expenseSchema);
