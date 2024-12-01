import React from 'react';
import CreateEngineers from '@/components/CreateEngineers';
import engineerAction from '@/lib/actions/engineer/engineerAction';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/data-table';
import { columns } from '@/components/admin/EngineerColumns';

const Engineers: React.FC<{}> = async () => {
  const res = await engineerAction.FETCH.fetchAllEngineers();
  let tempEngineers;
  if (res.success) {
    tempEngineers = await JSON.parse(res.data);
  }
  const engineers = tempEngineers.map((engineer) => {
    return {
      ...engineer, // Include all existing properties
      department: engineer.department.departmentName, // Replace department object with departmentName
    };
  });

  return (
    <Tabs defaultValue='addEngineer'>
      <h1 className='font-bold text-base text-blue-500 border-b-2 border-blue-500 text-center py-2 mb-4'>
        Engineers{' '}
      </h1>
      <TabsList className='grid w-full grid-cols-2  justify-content-center bg-white '>
        <TabsTrigger value='addEngineer'>Add Engineer</TabsTrigger>
        <TabsTrigger value='viewEngineers'>View Engineers</TabsTrigger>
      </TabsList>
      <TabsContent value='addEngineer'>
        <CreateEngineers />
      </TabsContent>
      <TabsContent value='viewEngineers'>
        <DataTable columns={columns} data={engineers} filterValue='name' />
      </TabsContent>
    </Tabs>
  );
};

export default Engineers;
