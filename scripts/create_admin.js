const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const User = require('../db/mongoDB/models/user');
const { USER_TYPES } = require('../constants/authConstant');

const createAdmin = async () => {
    try {
        const dbUrl = process.env.DB_URL;
        await mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB...');

        const adminData = {
            username: 'smoke_test_admin',
            password: 'Password@123',
            email: 'admin@test.com',
            userType: USER_TYPES.Admin,
            isActive: true,
            isDeleted: false
        };

        // Check if user already exists
        const existingUser = await User.findOne({ username: adminData.username });
        if (existingUser) {
            console.log('Admin user already exists. Updating password...');
            existingUser.password = adminData.password;
            await existingUser.save();
        } else {
            console.log('Creating new admin user...');
            await User.create(adminData);
        }

        console.log('✅ Admin user ready!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
