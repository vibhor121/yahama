const mongoose = require('mongoose');

const connectDB = async (db_url) => {
    try {
        await mongoose.connect(db_url, {
      
        });
        console.log('Database connection successful');
    } catch (error) {
        console.error('Database connection error:', error.message);
        process.exit(1); 
    }
};

module.exports = connectDB;
