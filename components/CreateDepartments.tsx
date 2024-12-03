'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createDepartment } from '@/lib/actions/department/create';
import toast from 'react-hot-toast';
import { Loader2, CircleX } from 'lucide-react';
import { Pencil } from 'lucide-react';
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
import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { MdEdit } from 'react-icons/md';
import { RxCrossCircled } from 'react-icons/rx';
import departmentAction from '@/lib/actions/department/departmentAction';

const schema = z.object({
  departmentName: z.string().trim().min(1, 'Required'), // Make name required with minimum length
});

type FormFields = z.infer<typeof schema>;

const CreateDepartments = () => {
  const form = useForm<FormFields>({
    defaultValues: {
      departmentName: '',
    },
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<FormFields> = async (data: FormFields) => {
    try {
      console.log(data);

      const response = await departmentAction.CREATE.createDepartment(
        data.departmentName
      );
      console.log(response);

      if (response.success) {
        toast.success(response.message);
        form.reset({
          departmentName: '',
        });
        console.log('Department created successfully:', response.data);
      } else {
        toast.error(response.message || 'Unable to create department');
        console.error('Error creating department:', response.message);
      }
    } catch (error) {
      toast.error('Internal Server Error');
      console.error('Internal Server Error:', error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='border-[1px] border-gray-300 rounded-md shadow-lg flex flex-col gap-6 mt-4'
      >
        <h2 className='bg-blue-50 font-semibold p-1 text-base py-2 text-center'>
          Add Department
        </h2>
        <div className='flex flex-col md:flex-row p-3 gap-4'>
          <FormField
            control={form.control}
            name='departmentName'
            render={({ field }) => (
              <FormItem className=' flex-col flex gap-1 flex-1'>
                <FormLabel>Department</FormLabel>
                <FormControl>
                  {field.value ? (
                    <Input
                      placeholder=''
                      {...field}
                      className=' bg-white w-80'
                    />
                  ) : (
                    <Input
                      placeholder='Enter Department Name'
                      {...field}
                      className=' bg-white w-80'
                    />
                  )}
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className='p-4 gap-1 flex flex-col md:flex-row justify-center items-center'>
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

export default CreateDepartments;
