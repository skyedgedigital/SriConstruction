'use server';
import { ApiResponse } from '@/interfaces/APIresponses.interface';
import mongoose from 'mongoose';

export const connectToDB = async (): Promise<ApiResponse<any>> => {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log('Already connected to MongoDB');
      return {
        success: true,
        status: 200,
        message: 'Already connected to MongoDB',
        data: null,
        error: null,
      };
    }

    let dbString: string = '';

    dbString =
      process.env.NODE_ENV === 'development'
        ? process.env.DATABASE_URL_DEV
        : process.env.DATABASE_URL_PRD;

    await mongoose.connect(`${dbString}`, {
      serverSelectionTimeoutMS: 50000,
    });

    console.log('Connected to MongoDB');
    return {
      success: true,
      status: 200,
      message: 'Connected to MongoDB',
      error: null,
      data: null,
    };
  } catch (error) {
    // Check for specific error types
    if (error.name === 'MongoNetworkError') {
      return {
        data: null,
        success: false,
        status: 500,
        message:
          'Network error: Unable to reach the database. Please check your network connection.',
        error: error.message,
      };
    } else if (error.name === 'MongoParseError') {
      return {
        data: null,
        success: false,
        status: 500,
        message:
          'Connection string error: Please check your database connection string.',
        error: error.message,
      };
    } else if (error.code === 'UND_ERR_CONNECT_TIMEOUT') {
      console.error('Connection timeout error:', error.message);
      return {
        data: null,
        success: false,
        status: 500,
        message:
          'Database connection timed out. Please check your Network connection and database server.',
        error: error.message,
      };
    } else if (error.code === 'ECONNRESET') {
      console.error('Connection reset error:', error.message);
      return {
        data: null,
        success: false,
        status: 500,
        message:
          'Connection was reset. Please check your Database server or Network Connection.',
        error: error.message,
      };
    } else if (error.code === 'ENOTFOUND') {
      console.error('DNS resolution error:', error.message);
      return {
        data: null,
        success: false,
        status: 500,
        message:
          'DNS resolution failed. Please check the hostname and your Network Connection.',
        error: error.message,
      };
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused error:', error.message);
      return {
        data: null,
        success: false,
        status: 500,
        message:
          'Connection was refused. Please ensure your database server is running and have Network Connection.',
        error: error.message,
      };
    } else if (error.name === 'MongoTimeoutError') {
      console.error('MongoDB timeout error:', error.message);
      return {
        data: null,
        success: false,
        status: 500,
        message:
          'MongoDB connection timed out. Please check your database server or Network Connection.',
        error: error.message,
      };
    } else if (error.name === 'MongoServerSelectionError') {
      console.error('MongoDB server selection error:', error.message);
      return {
        data: null,
        success: false,
        status: 500,
        message:
          'Unable to select a MongoDB server. Please check your database configuration.',
        error: error.message,
      };
    }
    // Handle other errors
    return {
      data: null,
      success: false,
      status: 500,
      message:
        'Database connection failed. Please ensure your database server is running and accessible.',
      error: error.message || 'Database connection failed.',
    };
  }
};

const handleDBConnection = async (): Promise<ApiResponse<any>> => {
  try {
    const connectionRes = await connectToDB();
    console.log('connection res', connectionRes);
    if (!connectionRes.success) {
      return {
        success: false,
        status: connectionRes.status,
        message: connectionRes.message,
        data: null,
        error: JSON.stringify(connectionRes.error),
      };
    }
    return {
      success: true,
      status: 200,
      message: 'Connected to MongoDB',
      data: null,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      status: 500,
      message:
        JSON.stringify(error.message) || 'Unexpected Error, Please Try Later',
      error: JSON.stringify(error),
      data: null,
    };
  }
};
export default handleDBConnection;
