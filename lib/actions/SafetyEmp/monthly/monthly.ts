'use server';

import handleDBConnection from '@/lib/database';
import MonthlyTask from '@/lib/models/safetyPanel/emp/monthlyTask.model';

const addMonthlyTask = async (dataString: string) => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const dataObj = JSON.parse(dataString);
    const dateString = dataObj.date;
    const [year, month, day] = dateString.split('-');
    const docObj = new MonthlyTask({
      day: day,
      month: month,
      year: year,
      event: dataObj.event,
    });
    const result = await docObj.save();
    return {
      success: true,
      status: 200,
      message: 'Monthly Task Added Successfully',
      data: JSON.stringify(result),
    };
  } catch (err) {
    return {
      status: 500,
      message: 'Internal Server Error',
      err: JSON.stringify(err),
      success: false,
    };
  }
};

const deleteMonthlyTask = async (eventId: any) => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const result = await MonthlyTask.deleteOne({ _id: eventId });
    return {
      success: true,
      status: 200,
      message: 'Event Deleted',
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      status: 500,
      message: 'Internal Server Error',
      err: JSON.stringify(err),
    };
  }
};

const updateMonthlyTask = async (eventId: any, dataString: string) => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const dataObj = JSON.parse(dataString);
    const [day, month, year] = dataObj.date.split('-');
    const result = await MonthlyTask.findOneAndUpdate(
      {
        _id: eventId,
      },
      {
        day: day,
        month: month,
        year: year,
        event: dataObj.event,
      },
      {
        new: true,
      }
    );
    return {
      success: true,
      status: 200,
      message: 'Event Updated',
      data: JSON.stringify(result),
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      status: 500,
      message: 'Internal Server Error',
      err: JSON.stringify(err),
    };
  }
};

const fetchMonthlyTask = async () => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const result = await MonthlyTask.find({});
    return {
      success: true,
      status: 200,
      message: 'Events Fetched',
      data: JSON.stringify(result),
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      status: 500,
      message: 'Internal Server Error',
      err: JSON.stringify(err),
    };
  }
};

export {
  addMonthlyTask,
  deleteMonthlyTask,
  updateMonthlyTask,
  fetchMonthlyTask,
};
