const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    const connUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agrishare';
    await mongoose.connect(connUri);
    console.log('[Seed] Connected to MongoDB');

    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@agrishare.com').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@AgriShare2026';

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log(`[Seed Notice] Admin already exists with email: ${adminEmail}`);
      process.exit(0);
    }

    const admin = new User({
      name: 'AgriShare Chief Administrator',
      email: adminEmail,
      password: adminPassword,
      phone: '+91 98765 43210',
      village: 'Pune Central',
      district: 'Pune',
      state: 'Maharashtra',
      landholdingSize: 'N/A (System Admin)',
      farmingType: 'Administration',
      role: 'admin'
    });

    await admin.save();
    console.log(`[Seed Success] First Admin account created successfully!`);
    console.log(`Email: ${adminEmail}`);
    console.log(`Role: admin`);
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error.message);
    process.exit(1);
  }
};

seedAdmin();
