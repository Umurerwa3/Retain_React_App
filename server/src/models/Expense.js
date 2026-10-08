import mongoose from 'mongoose';

export const PAYMENT_METHODS = ['cash', 'credit_card', 'debit_card', 'mobile_money', 'bank_transfer', 'other'];

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 100,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    paymentMethod: {
      type: String,
      enum: { values: PAYMENT_METHODS, message: 'Invalid payment method' },
      required: [true, 'Payment method is required'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
  },
  { timestamps: true }
);

// Most queries are "this user's expenses, newest first"
expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ title: 'text', notes: 'text' });

export default mongoose.model('Expense', expenseSchema);
