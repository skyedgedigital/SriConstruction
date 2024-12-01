'use server';

import handleDBConnection from '@/lib/database';
import CorrectiveAndPreventive from '@/lib/models/safetyPanel/emp/weekly/correctiveAndPreventive.model';

const genCorrectiveAndPreventive = async (dataString: string) => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const data = JSON.parse(dataString);
    const docObj = new CorrectiveAndPreventive({
      ...data,
    });
    const resp = await docObj.save();
    return {
      success: true,
      status: 200,
      message: 'House Keeping Audit Created Successfully',
      data: JSON.stringify(resp),
    };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message: 'An Error Occurred',
    };
  }
};

const deleteCorrectiveAndPreventive = async (id: any) => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const resp = await CorrectiveAndPreventive.findByIdAndDelete(id);
    return {
      success: true,
      status: 200,
      message: 'House Keeping Audit Deleted Successfully',
    };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message: 'An Error Occurred',
    };
  }
};

const fetchCorrectiveAndPreventive = async () => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const resp = await CorrectiveAndPreventive.find().sort({
      createdAt: -1,
    });
    return {
      success: true,
      status: 200,
      message: 'House Keeping Audit Fetched Successfully',
      data: JSON.stringify(resp),
    };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message: 'An Error Occurred',
    };
  }
};

export {
  genCorrectiveAndPreventive,
  deleteCorrectiveAndPreventive,
  fetchCorrectiveAndPreventive,
};
