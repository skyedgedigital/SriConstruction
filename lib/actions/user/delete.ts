'use server';
import handleDBConnection from '@/lib/database';
import Admin from '@/lib/models/admin.model';
import User from '@/lib/models/user.model';
import { admin, user } from '@/types/user.type';

const deleteUser = async (userInfo: user) => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    var user = await User.deleteOne(userInfo);
    return {
      success: true,
      status: 204,
      message: 'User deleted successfully',
    };
  } catch (error) {
    return {
      success: false,
      status: 500,
      message: 'Internal server Error',
      error: JSON.stringify(error),
    };
  }
};

const deleteAdmin = async (adminInfo: admin) => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    var admin = await Admin.deleteOne(adminInfo);
    return {
      success: true,
      status: 204,
      message: 'Admin deletes successfully',
    };
  } catch (error) {
    return {
      success: false,
      status: 500,
      message: 'Internal server Error',
      error: JSON.stringify(error),
    };
  }
};

export { deleteAdmin, deleteUser };
