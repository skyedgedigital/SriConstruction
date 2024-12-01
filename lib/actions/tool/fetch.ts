'use server';

import handleDBConnection from '@/lib/database';
import Tool from '@/lib/models/tool.model';

const fetchTools = async () => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const tools = await Tool.find({});

    return {
      success: true,
      message: 'Tools Fetched',
      status: 200,
      data: JSON.stringify(tools),
    };
  } catch (err) {
    return {
      success: false,
      message: 'Unexpected Error Occurred, Failed to fetch tools',
      err: JSON.stringify(err),
    };
  }
};

export { fetchTools };
