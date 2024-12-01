import React from 'react';
import EnterpriseDetailsForm from '@/components/forms/EnterpriseDetailsForm';
import CreateDepartments from '@/components/CreateDepartments';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/data-table';
import departmentAction from '@/lib/actions/department/departmentAction';
import { columns } from '@/components/admin/DepartmentColumns';

const EnterpriseDetails: React.FC<{}> = async () => {
  const res = await departmentAction.FETCH.fetchAllDepartments();
  let departments;
  if (res.success) {
    departments = JSON.parse(res.data);
  }
  console.log('bruhhhhh', departments);
  return (
    <Tabs defaultValue='manageEnterprise'>
      <h1 className='font-bold text-blue-500 border-b-2 border-blue-500 text-center py-2 mb-4'>
        Enterprise Details
      </h1>
      <TabsList className='grid w-full grid-cols-2 justify-content-center'>
        <TabsTrigger value='manageEnterprise'>Manage Enterprise</TabsTrigger>
        <TabsTrigger value='viewDepartments'>View Departments</TabsTrigger>
      </TabsList>
      <TabsContent value='manageEnterprise'>
        <div className='flex flex-col gap-10'>
          <EnterpriseDetailsForm />
          <CreateDepartments />
        </div>
      </TabsContent>
      <TabsContent value='viewDepartments'>
        <section>
          <div className='container '>
            {/* <h1 className='mb-6 text-3xl font-bold '>All Drivers</h1> */}
            <DataTable
              columns={columns}
              data={departments}
              filterValue='departmentName'
            />
          </div>
        </section>
      </TabsContent>
    </Tabs>
  );
};

export default EnterpriseDetails;
