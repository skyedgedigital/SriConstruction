'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { fetchAllDepartments } from '@/lib/actions/department/fetch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import toast from 'react-hot-toast';
import engineerAction from '@/lib/actions/engineer/engineerAction';
import { Loader2 } from 'lucide-react';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from './ui/button';

const schema = z.object({
  name: z.string().trim().min(1, 'Required'), // Make name required with minimum length
  department: z.string().trim().min(1, 'Required'),
});

type FormFields = z.infer<typeof schema>;

const CreateEngineer: React.FC<{}> = () => {
  const [allDepartments, setAllDepartments] = useState([]);

  const form = useForm<FormFields>({
    defaultValues: {
      name: '',
      department: '',
    },
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<FormFields> = async (data: FormFields) => {
    try {
      console.log(data);

      const response = await engineerAction.CREATE.createEngineer(
        data.name,
        data.department
      );
      console.log(response);

      if (response.success) {
        toast.success(response.message);
        console.log('Engineer created successfully:', response.data);
      } else {
        toast.error(response.message);
        console.error('Error creating engineer:', response.message);
      }
    } catch (error) {
      toast.error('Internal Server Error');
      console.error('Internal Server Error:', error);
    }
  };

  useEffect(() => {
    const fetch = async () => {
      const res = await fetchAllDepartments();
      if (res.success) {
        const vehicleNumbers = JSON.parse(res.data).map(
          (department) => department.departmentName
        );
        setAllDepartments(vehicleNumbers);
      } else {
        console.error('Failed to fetch departments');
      }
    };
    fetch();
  }, []);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='border-[1px] border-gray-300 rounded-md shadow-lg flex flex-col gap-6 mt-4'
      >
        <h2 className='bg-blue-50 font-semibold p-1 text-base py-2 text-center'>
          Add Engineer
        </h2>
        <div className='px-4 grid grid-cols-1 md:grid-cols-2 gap-3'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem className=' flex-col flex gap-1 flex-1'>
                <FormLabel>Engineer</FormLabel>
                <FormControl>
                  {field.value ? (
                    <Input placeholder='' {...field} className=' bg-white ' />
                  ) : (
                    <Input
                      placeholder='Enter Engineer Name'
                      {...field}
                      className=' bg-white '
                    />
                  )}
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='department'
            render={({ field }) => (
              <FormItem className=' flex-col flex gap-1 flex-1'>
                <FormLabel>Department</FormLabel>
                <Select
                  onValueChange={(e) => {
                    field.onChange(e);
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      {field.value ? (
                        <SelectValue placeholder='' />
                      ) : (
                        'Select Deaprtment'
                      )}
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className='max-w-80 max-h-72'>
                    {allDepartments?.map((option, index) => (
                      <SelectItem key={option} value={option.toString()}>
                        {option.toString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className='p-4 flex flex-col md:flex-row gap-1 justify-center items-center'>
          <Button
            type='submit'
            className='flex items-center gap-1 border-2 px-4 rounded bg-gray-800 text-white'
            // onClick={handleSubmit(onSubmit)}
          >
            {form.formState.isSubmitting && (
              <Loader2 className='h-4 w-4 animate-spin' />
            )}
            <>Submit</>
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateEngineer;
