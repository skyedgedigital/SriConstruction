'use server';
import { ApiResponse } from '@/interfaces/APIresponses.interface';
import handleDBConnection from '@/lib/database';
import EmployeeData from '@/lib/models/HR/EmployeeData.model';

// CREATE

// Add an entry to Damage Register
const addEmployeeToDamageRegister = async (
  dataString: string
): Promise<ApiResponse<any>> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const dataObj = JSON.parse(dataString);

    const { employeeId, damageEntry } = dataObj; // Assume dataObj contains employeeId and the damage register entry
    const employee = await EmployeeData.findById(employeeId);

    if (!employee) {
      return {
        success: false,
        status: 404,
        message: 'Employee not found',
        data: null,
        error: null,
      };
    }

    employee.damageRegister.push(damageEntry); // Add the new damage entry
    const res = await employee.save();

    return {
      success: true,
      status: 200,
      message: 'Damage register updated successfully',
      error: null,
      data: JSON.stringify(res),
    };
  } catch (error) {
    return {
      success: false,
      status: 500,
      message:
        'Unexpected error occurred, Failed to update bank, Please Try Later',
      error: JSON.stringify(error),
      data: null,
    };
  }
};

// Add an entry to Advance Register
const addEmployeeToAdvanceRegister = async (
  dataString: string
): Promise<ApiResponse<any>> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const dataObj = JSON.parse(dataString);

    const { employeeId, advanceEntry } = dataObj; // Assume dataObj contains employeeId and the advance register entry
    const employee = await EmployeeData.findById(employeeId);

    if (!employee) {
      return {
        success: false,
        status: 404,
        message: 'Employee not found',
        data: null,
        error: JSON.stringify(employee),
      };
    }

    employee.advanceRegister.push(advanceEntry); // Add the new advance entry
    const res = await employee.save();
    if (!res) {
      return {
        success: false,
        status: 500,
        message:
          'Unexpected error occurred, Failed to Employee in Advance Register, Please Try Later',
        error: JSON.stringify(res),
        data: null,
      };
    }
    return {
      success: true,
      status: 200,
      message: 'Advance register updated successfully',
      error: null,
      data: JSON.stringify(res),
    };
  } catch (error) {
    return {
      success: false,
      status: 500,
      message:
        'Unexpected error occurred, Failed to Employee in Advance Register, Please Try Later',
      error: JSON.stringify(error),
      data: null,
    };
  }
};

// FETCH

// Fetch all Damage Register entries within a date range
const fetchDamageRegister = async (
  fromDate: string,
  toDate: string
): Promise<ApiResponse<any>> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    // Connect to the database

    // Parse the date range
    const from = new Date(fromDate);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999); // Include the entire "to" day

    // Fetch employees with the required fields
    const employees = await EmployeeData.find({}, 'name damageRegister')
      .populate('designation')
      .lean();

    // Process the data
    const data = employees.flatMap((employee) =>
      (employee.damageRegister || []) // Safeguard if damageRegister is undefined
        .filter((entry) => {
          const entryDate = new Date(entry.dateOfDamageOrLoss);
          return entryDate >= from && entryDate <= to;
        })
        .map((entry) => ({
          employeeName: employee.name, // Add employee name to each entry
          designation: employee.designation.designation,
          fatherorhusband: employee.fathersName || 'NA',
          ...entry,
        }))
    );

    // Return success response
    return {
      success: true,
      status: 200,
      message: 'Damage Register Retrived Succesfully!',
      data: JSON.stringify(data),
      error: null,
    };
  } catch (error) {
    // Catch and return detailed error information
    return {
      success: false,
      status: 500,
      message:
        'Unexpected error occurred, Failed to fetch Damage register, Please Try Later',
      error: JSON.stringify(error),
      data: null,
    };
  }
};

// Fetch all Advance Register entries within a date range
const fetchAdvanceRegister = async (
  fromDate: string,
  toDate: string
): Promise<ApiResponse<any>> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    // Connect to the database

    // Parse the date range
    const from = new Date(fromDate);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999); // Include the entire "to" day

    // Fetch employees with the required fields
    const employees = await EmployeeData.find({}, 'name advanceRegister')
      .populate('designation')
      .lean();

    // Process the data
    const data = employees.flatMap((employee) =>
      (employee.advanceRegister || []) // Safeguard if advanceRegister is undefined
        // .filter(entry => {
        //     const entryDate = new Date(entry.dateOfAdvanceGiven);
        //     return entryDate >= from && entryDate <= to;
        // })
        .map((entry) => ({
          employeeName: employee.name,
          designation: employee.designation.designation,
          fatherorhusband: employee.fathersName,
          ...entry,
        }))
    );

    const filterData = data.filter((entry) => {
      const entryDate = new Date(entry.dateOfAdvanceGiven);
      return (
        !isNaN(entryDate.getTime()) && entryDate >= from && entryDate <= to
      );
    });

    // Return success response
    return {
      success: true,
      status: 200,
      message: 'Advance Register Retrived Succesfully!',
      data: JSON.stringify(filterData),
      error: null,
    };
  } catch (error) {
    // Catch and return detailed error information
    return {
      success: false,
      status: 500,
      message:
        'Unexpected error occurred, Failed to fetch Advance Register, Please Try Later',
      error: error.message || JSON.stringify(error),
      data: null,
    };
  }
};

// Fetch Advance and Damage Register for a Specific Employee by ID
const fetchEmployeeRegisterById = async (
  employeeId: string
): Promise<ApiResponse<any>> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    // Connect to the database

    // Fetch employee data
    const employee = await EmployeeData.findById(
      employeeId,
      'name fathersName designation damageRegister advanceRegister'
    )
      .populate('designation') // Include designation details
      .lean();

    // Check if employee exists
    if (!employee) {
      return {
        success: false,
        status: 404,
        message: 'Employee not found',
        data: null,
        error: null,
      };
    }

    // Prepare the response
    const response = {
      employeeName: employee.name,
      designation: employee.designation?.designation || 'NA',
      fatherorhusband: employee.fathersName || 'NA',
      damageRegister: employee.damageRegister || [],
      advanceRegister: employee.advanceRegister || [],
    };

    // Return success response
    return {
      success: true,
      status: 200,
      message: 'Employee Advance and Damage Register Retrieved Successfully',
      data: JSON.stringify(response),
      error: null,
    };
  } catch (error) {
    // Handle server errors
    return {
      success: false,
      status: 500,
      message:
        'Unexpected error occurred, Failed to fetch Employee Register, Please Try Later',
      error: error.message || JSON.stringify(error),
      data: null,
    };
  }
};

// Update a specific entry in the Damage Register
const updateDamageRegisterEntry = async (
  employeeId: string,
  entryId: string,
  updatedData: any
): Promise<ApiResponse<any>> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const employee = await EmployeeData.findById(employeeId);
    if (!employee) {
      return {
        success: false,
        status: 404,
        message: 'Employee not found',
        data: null,
        error: null,
      };
    }

    const entry = employee.damageRegister.id(entryId); // Find the specific entry
    if (!entry) {
      return {
        success: false,
        status: 404,
        message: 'Damage register entry not found',
        data: null,
        error: null,
      };
    }

    Object.assign(entry, updatedData); // Update the entry
    const res = await employee.save();
    if (!res) {
      return {
        success: false,
        status: 400,
        message: 'Failed to update Damage Registry, Please Try Later',
        error: null,
        data: null,
      };
    }
    return {
      success: true,
      status: 200,
      message: 'Damage register entry updated successfully',
      error: null,
      data: JSON.stringify(res),
    };
  } catch (error) {
    return {
      success: false,
      status: 500,
      message:
        'Unexpected error occurred, Failed to update Damage Register, Please Try Later',
      error: JSON.stringify(error),
      data: null,
    };
  }
};

// Update a specific entry in the Advance Register
const updateAdvanceRegisterEntry = async (
  employeeId: string,
  entryId: string,
  updatedData: any
): Promise<ApiResponse<any>> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    const employee = await EmployeeData.findById(employeeId);
    if (!employee) {
      return {
        success: false,
        status: 404,
        message: 'Employee not found',
        data: null,
        error: null,
      };
    }

    const entry = employee.advanceRegister.id(entryId); // Find the specific entry
    if (!entry) {
      return {
        success: false,
        status: 404,
        message: 'Advance register entry not found',
        data: null,
        error: null,
      };
    }

    Object.assign(entry, updatedData); // Update the entry
    const res = await employee.save();
    if (!res) {
      return {
        success: false,
        status: 400,
        message: 'Failed to update Advance Registry, Please try later',
        data: null,
        error: null,
      };
    }
    return {
      success: true,
      status: 200,
      message: 'Advance register entry updated successfully',
      data: JSON.stringify(res),
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      status: 500,
      message:
        'Unexpected error occurred, Failed to update Damage Register, Please Try Later',
      error: JSON.stringify(error),
      data: null,
    };
  }
};

const updateDamageInstallment = async (
  employeeId,
  damageId
): Promise<ApiResponse<any>> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    // Retrieve the employee record with only required fields
    const employee = await EmployeeData.findOne(
      { _id: employeeId },
      { damageRegister: 1 } // Only fetch the damageRegister field
    ).lean(); // Use `.lean()` to return a plain JavaScript object

    if (!employee) {
      throw new Error(`Employee with ID ${employeeId} not found`);
    }

    // Find the damage entry in the damageRegister array
    const damageEntryIndex = employee.damageRegister.findIndex(
      (entry) => entry._id.toString() === damageId
    );

    if (damageEntryIndex === -1) {
      throw new Error(`Damage entry with ID ${damageId} not found`);
    }

    const damageEntry = employee.damageRegister[damageEntryIndex];

    if (damageEntry.installmentsLeft <= 0) {
      throw new Error(`No installments left for this damage entry`);
    }

    // Decrement installmentsLeft by 1
    const updatedInstallmentsLeft = damageEntry.installmentsLeft - 1;

    // Update the damage entry directly in the database
    const updateResult = await EmployeeData.updateOne(
      { _id: employeeId, 'damageRegister._id': damageId },
      { $set: { 'damageRegister.$.installmentsLeft': updatedInstallmentsLeft } }
    );

    if (updateResult.nModified === 0) {
      throw new Error(`Failed to update damage installment`);
    }

    console.log('Damage installment updated successfully:', {
      damageId,
      updatedInstallmentsLeft,
    });
    return {
      success: true,
      data: JSON.stringify({ damageId, updatedInstallmentsLeft }),
      message: 'Damage installment updated successfully',
      error: null,
      status: 200,
    };
  } catch (error) {
    console.error('Error updating damage installment:', error.message);
    return {
      success: false,
      message:
        'Unexpected error occurred, Failed to update Damage Register, Please Try Later',
      status: 500,
      error: JSON.stringify(error),
      data: null,
    };
  }
};

const updateAdvanceInstallment = async (
  employeeId,
  advanceId
): Promise<ApiResponse<any>> => {
  const dbConnection = await handleDBConnection();
  if (!dbConnection.success) return dbConnection;
  try {
    // Retrieve the employee record with only required fields
    const employee = await EmployeeData.findOne(
      { _id: employeeId },
      { advanceRegister: 1 } // Only fetch the advanceRegister field
    ).lean(); // Use `.lean()` to return a plain JavaScript object

    if (!employee) {
      throw new Error(`Employee with ID ${employeeId} not found`);
    }

    // Find the advance entry in the advanceRegister array
    const advanceEntryIndex = employee.advanceRegister.findIndex(
      (entry) => entry._id.toString() === advanceId
    );

    if (advanceEntryIndex === -1) {
      throw new Error(`Advance entry with ID ${advanceId} not found`);
    }

    const advanceEntry = employee.advanceRegister[advanceEntryIndex];

    if (advanceEntry.installmentsLeft <= 0) {
      throw new Error(`No installments left for this advance entry`);
    }

    // Decrement installmentsLeft by 1
    const updatedInstallmentsLeft = advanceEntry.installmentsLeft - 1;

    // Update the advance entry directly in the database
    const updateResult = await EmployeeData.updateOne(
      { _id: employeeId, 'advanceRegister._id': advanceId },
      {
        $set: { 'advanceRegister.$.installmentsLeft': updatedInstallmentsLeft },
      }
    );

    if (updateResult.nModified === 0) {
      throw new Error(`Failed to update advance installment`);
    }

    console.log('Advance installment updated successfully:', {
      advanceId,
      updatedInstallmentsLeft,
    });
    return {
      success: true,
      data: JSON.stringify({ advanceId, updatedInstallmentsLeft }),
      message: 'Advance installment updated successfully',
      status: 200,
      error: null,
    };
  } catch (error) {
    console.error('Error updating advance installment:', error.message);
    return {
      success: false,
      message:
        'Unexpected error occurred, Failed to update Damage Register, Please Try Later',
      error: JSON.stringify(error),
      data: null,
      status: 500,
    };
  }
};

export {
  addEmployeeToDamageRegister,
  addEmployeeToAdvanceRegister,
  fetchDamageRegister,
  fetchAdvanceRegister,
  updateDamageRegisterEntry,
  updateDamageInstallment,
  updateAdvanceInstallment,
  updateAdvanceRegisterEntry,
  fetchEmployeeRegisterById,
};
