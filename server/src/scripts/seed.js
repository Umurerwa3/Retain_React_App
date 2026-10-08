/**
 * Seeds the database with the default categories and an admin account.
 * Safe to run multiple times: existing records are left untouched.
 *
 *   npm run seed
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { seedData } from '../services/seedService.js';

async function seed() {
  await connectDB();
  await seedData();
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
