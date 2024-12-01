'use server';

import handleDBConnection from '@/lib/database';
import AttendanceUploads from '@/lib/models/safetyPanel/toolBoxTalk/attendanceUploads.model';

const genAttUpload = async (dataString: string) => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const data = JSON.parse(dataString);
    const docObj = new AttendanceUploads({
      ...data,
    });
    const resp = await docObj.save();
    return {
      success: true,
      data: JSON.stringify(resp),
      message: 'Tool Box Talk created successfully',
      status: 200,
    };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message: 'An Error Occurred',
    };
  }
};

const deleteAttUploads = async (id: any) => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const resp = await AttendanceUploads.findByIdAndDelete(id);
    return {
      success: true,
      data: JSON.stringify(resp),
      message: 'Tool Box Talk deleted successfully',
      status: 200,
    };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message: 'An Error Occurred',
    };
  }
};

const fetchAttUploads = async () => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const resp = await AttendanceUploads.find({}).sort({
      createdAt: -1,
    });
    return {
      success: true,
      data: JSON.stringify(resp),
      message: 'Tool Box Talk fetched successfully',
      status: 200,
    };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message: 'An Error Occurred',
    };
  }
};

export { genAttUpload, fetchAttUploads, deleteAttUploads };
