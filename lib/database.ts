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
          'Database connection timed out. Please check your network connection and database server.',
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
