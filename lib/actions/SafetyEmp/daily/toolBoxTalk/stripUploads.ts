'use server';

import handleDBConnection from '@/lib/database';
import AttendanceUploads from '@/lib/models/safetyPanel/toolBoxTalk/attendanceUploads.model';
import StripUploads from '@/lib/models/safetyPanel/toolBoxTalk/stripUploads.model';

const genStripUploads = async (dataString: string) => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const data = JSON.parse(dataString);
    const docObj = new StripUploads({
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

const deleteStripUploads = async (id: any) => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const resp = await StripUploads.findByIdAndDelete(id);
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

const fetchStripUploads = async () => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const resp = await StripUploads.find({}).sort({
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

export { genStripUploads, fetchStripUploads, deleteStripUploads };
