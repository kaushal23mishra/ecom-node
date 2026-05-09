const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcrypt');

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

const DB_URL = 'mongodb://127.0.0.1:27017/';

async function seed() {
  try {
    console.log('🌱 Connecting to database for seeding...');
    await mongoose.connect(DB_URL);
    console.log('✅ Connected to MongoDB');

    // Get Models (using require to avoid TS issues in a quick script)
    const Product = mongoose.model('product', new mongoose.Schema({}, { strict: false }));
    const Category = mongoose.model('category', new mongoose.Schema({}, { strict: false }));
    const User = mongoose.model('user', new mongoose.Schema({}, { strict: false }));

    // 1. Create Users with different roles
    console.log('👤 Creating Users...');
    const usersToInsert = [
      {
        password: 'password123',
        username: 'admin',
        email: 'user@gmail.com',
        isActive: true,
        userType: 1, // Admin
        isDeleted: false,
      },
      {
        password: 'password123',
        username: 'seller',
        email: 'seller@gmail.com',
        isActive: true,
        userType: 3, // Seller
        isDeleted: false,
      },
      {
        password: 'password123',
        username: 'customer',
        email: 'customer@gmail.com',
        isActive: true,
        userType: 2, // Customer
        isDeleted: false,
      },
    ];

    for (let u of usersToInsert) {
      u.password = await bcrypt.hash(u.password, 8);
      await User.updateOne({ email: u.email }, u, { upsert: true });
    }

    const admin = await User.findOne({ email: 'user@gmail.com' });
    console.log('✅ Users seeded');

    // 2. Clear existing dummy data
    console.log('🧹 Cleaning up old dummy data...');
    await Product.deleteMany({});
    await Category.deleteMany({});

    // 3. Create Categories
    console.log('📁 Creating Categories...');
    const categories = await Category.insertMany([
      { name: 'Electronics', isActive: true, addedBy: admin._id, isDeleted: false },
      { name: 'Fashion', isActive: true, addedBy: admin._id, isDeleted: false },
      { name: 'Mobiles', isActive: true, addedBy: admin._id, isDeleted: false },
      { name: 'Laptops', isActive: true, addedBy: admin._id, isDeleted: false },
    ]);

    const [electronics, fashion, mobiles, laptops] = categories;

    // 4. Create Products
    console.log('📦 Creating Products...');
    await Product.insertMany([
      {
        name: 'iPhone 15 Pro',
        price: 134900,
        brand: 'Apple',
        category: mobiles._id,
        isActive: true,
        isDeleted: false,
        addedBy: admin._id,
        description: 'Titanium design, A17 Pro chip.',
      },
      {
        name: 'Samsung Galaxy S24 Ultra',
        price: 129999,
        brand: 'Samsung',
        category: mobiles._id,
        isActive: true,
        isDeleted: false,
        addedBy: admin._id,
        description: 'Galaxy AI is here.',
      },
      {
        name: 'MacBook Air M2',
        price: 99900,
        brand: 'Apple',
        category: laptops._id,
        isActive: true,
        isDeleted: false,
        addedBy: admin._id,
        description: 'Supercharged by M2.',
      },
      {
        name: 'Nike Air Jordan 1',
        price: 15995,
        brand: 'Nike',
        category: fashion._id,
        isActive: true,
        isDeleted: false,
        addedBy: admin._id,
        description: 'Classic basketball style.',
      },
      {
        name: 'Sony WH-1000XM5',
        price: 29990,
        brand: 'Sony',
        category: electronics._id,
        isActive: true,
        isDeleted: false,
        addedBy: admin._id,
        description: 'Industry-leading noise cancellation.',
      },
    ]);

    console.log('🍺 Dummy data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
