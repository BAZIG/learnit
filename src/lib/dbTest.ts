import connectDB from './mongodb';
import User from '@/models/User';

export async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    
    // Connect to database
    await connectDB();
    
    // Get the current database name
    const db = (await import('mongoose')).connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    console.log('Connected to database:', db.databaseName);
    
    // Test user count
    const userCount = await User.countDocuments();
    console.log('Number of users in database:', userCount);
    
    // List all users (without passwords)
    const users = await User.find({}).select('-password');
    console.log('Users in database:', users.map(u => ({ id: u._id, email: u.email, name: u.name, role: u.role })));
    
    return {
      databaseName: db!.databaseName,
      userCount,
      users: users.map(u => ({ id: u._id, email: u.email, name: u.name, role: u.role }))
    };
  } catch (error) {
    console.error('Database test failed:', error);
    throw error;
  }
} 