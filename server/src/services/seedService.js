import Category from '../models/Category.js';
import User from '../models/User.js';

const CATEGORIES = [
  { name: 'Food & Dining', color: '#ef6c00', description: 'Groceries, restaurants and snacks' },
  { name: 'Transport', color: '#1e88e5', description: 'Fuel, fares and ride-hailing' },
  { name: 'Housing', color: '#6d4c41', description: 'Rent, repairs and furnishing' },
  { name: 'Utilities', color: '#00897b', description: 'Electricity, water, internet and phone' },
  { name: 'Entertainment', color: '#8e24aa', description: 'Movies, events and subscriptions' },
  { name: 'Health', color: '#e53935', description: 'Medical bills, pharmacy and fitness' },
  { name: 'Shopping', color: '#d81b60', description: 'Clothes, electronics and other purchases' },
  { name: 'Education', color: '#3949ab', description: 'Tuition, books and courses' },
];

/**
 * Creates the default categories and the admin account if they are missing.
 * Idempotent: existing records are left untouched.
 */
export async function seedData() {
  await Category.getDefault();
  for (const category of CATEGORIES) {
    await Category.updateOne({ name: category.name }, { $setOnInsert: category }, { upsert: true });
  }
  console.log(`Categories ready (${await Category.countDocuments()})`);

  const email = (process.env.ADMIN_EMAIL || 'admin@retain.app').toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
    }
    console.log(`Admin account exists: ${email}`);
  } else {
    await User.create({
      name: process.env.ADMIN_NAME || 'Retain Admin',
      email,
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'admin',
    });
    console.log(`Admin account created: ${email}`);
  }

}
