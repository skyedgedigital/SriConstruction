'use server';

import handleDBConnection from '@/lib/database';
import Site from '@/lib/models/HR/siteMaster.model';

const updateSiteMaster = async (dataString: string, docId: any) => {
  try {
    const dbConnection = await handleDBConnection();
    if (!dbConnection.success) return dbConnection;
    const data = JSON.parse(dataString);
    console.log(docId);
    const resp = await Site.findOneAndUpdate(
      {
        _id: docId,
      },
      {
        ...data,
      },
      {
        new: true,
      }
    );
    return {
      successs: true,
      status: 200,
      message: 'Designation Updated Successfully',
      data: JSON.stringify(resp),
    };
  } catch (err) {
    return {
      success: false,
      message: 'Internal Server Error',
      status: 500,
      error: JSON.stringify(err),
    };
  }
};

export { updateSiteMaster };
