import React from 'react';
import EmployeeManagement from '@/components/EmployeeManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import employeeAction from '@/lib/actions/employee/employeeAction';
import { columns } from '@/components/admin/EmployeeColumns';
import { DataTable } from '@/components/data-table';

const page = async () => {
  let res = await employeeAction.FETCH.fetchAllEmployees();
  const res1 = JSON.parse(res.data);
  // console.table("The output",res1);
  const tempFleetManagers = res1?.filter(
    (employee) => employee.employeeRole === 'FLEETMANAGER'
  );
  const fleetManagers = tempFleetManagers;
  console.log('The Fleet Managers', res1);
  res = await employeeAction.FETCH.fetchAllEmployees();
  const res2 = JSON.parse(res.data);
  const tempDrivers = res2?.filter(
    (employee) => employee.employeeRole === 'DRIVER'
  );
  const drivers = tempDrivers;
  const hr = JSON.parse(res?.data).filter(
    (employee) => employee.employeeRole === 'HR'
  );
  const safety = JSON.parse(res?.data).filter(
    (employee) => employee.employeeRole == 'Safety'
  );
  return (
    <Tabs defaultValue='addFleetManager'>
      <h1 className='font-bold text-blue-500 border-b-2 border-blue-500 text-center py-2 mb-4'>
        Employees
      </h1>
      <TabsList className='grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-8 gap-1 justify-content-center bg-white mb-20 sm:mb-10 lg:mb-0'>
        <TabsTrigger value='addFleetManager'>Add Fleet Manager</TabsTrigger>
        <TabsTrigger value='viewFleetManager'>View Fleet Managers</TabsTrigger>
        <TabsTrigger value='addDriver'>Add Driver</TabsTrigger>
        <TabsTrigger value='viewDriver'>View Drivers</TabsTrigger>
        <TabsTrigger value='addHR'>Add HR</TabsTrigger>
        <TabsTrigger value='addSafety'>Add Safety Manager</TabsTrigger>
        <TabsTrigger value='viewHR'>View HR</TabsTrigger>
        <TabsTrigger value='viewSafety'>View Safety</TabsTrigger>
      </TabsList>
      <TabsContent value='addFleetManager'>
        <EmployeeManagement heading='Add Fleet Manager ' role='FLEETMANAGER' />
      </TabsContent>
      <TabsContent value='viewFleetManager'>
        {/* <h1 className='mb-6 text-3xl font-bold '>All Drivers</h1> */}
        <DataTable columns={columns} data={fleetManagers} filterValue='name' />
      </TabsContent>
      <TabsContent value='addDriver'>
        <EmployeeManagement heading='Add Driver ' role='DRIVER' />
      </TabsContent>
      <TabsContent value='viewDriver'>
        {/* <h1 className='mb-6 text-3xl font-bold '>All Drivers</h1> */}
        <DataTable columns={columns} data={drivers} filterValue='name' />
      </TabsContent>
      <TabsContent value='addHR'>
        <EmployeeManagement heading='Add HR ' role='HR' />
      </TabsContent>
      <TabsContent value='addSafety'>
        <EmployeeManagement heading='Add Safety Manager ' role='Safety' />
      </TabsContent>

      <TabsContent value='viewHR'>
        <DataTable columns={columns} data={hr} filterValue='name' />
      </TabsContent>

      <TabsContent value='viewSafety'>
        <DataTable columns={columns} data={safety} filterValue='name' />
      </TabsContent>
    </Tabs>
  );
};

export default page;
