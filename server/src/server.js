import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';
import { seedData } from './services/seedService.js';

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  // Hosts without shell access (e.g. Render free tier) still get categories and an admin
  await seedData();
  app.listen(PORT, () => {
    console.log(`Retain API listening on port ${PORT}`);
  });
}

start();
