'use client';

import { loginUser } from '@/types/user.type';
import { signIn, useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { redirect, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
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
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { createEmployee } from '@/lib/actions/employee/create';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import truck_crane from '@/public/assets/vehicles/truck-crane.jpg';
import excavator from '@/public/assets/vehicles/excavator.jpg';
import useConnectionStatus from '@/hooks/onlineandDatabaseConnection';
import { IEnterprise } from '@/interfaces/enterprise.interface';
import { fetchEnterpriseInfo } from '@/lib/actions/enterprise';

const schema = z.object({
  phoneNo: z
    .string({
      required_error: 'Required',
    })
    .regex(/^\d+$/, { message: 'Invalid Phone Number' }),
  // .length(10, { message: "Invalid Phone Number" })
  // .refine((value) => /[6789]/.test(value[0]), { message: "Invalid Phone Number" }),

  password: z.string().trim().min(1, 'Required'),
});

type FormFields = z.infer<typeof schema>;

const LoginForm: React.FC<{}> = () => {
  const [ent, setEnt] = useState<IEnterprise | null>(null);
  const { dbConnectionStatus, isOnline } = useConnectionStatus();
  const form = useForm<FormFields>({
    defaultValues: {
      password: '',
      phoneNo: '',
    },
    resolver: zodResolver(schema),
  });

  const session = useSession();

  useEffect(() => {
    if (session.status === 'authenticated') {
      redirect(`/${session?.data?.user?.access.toLowerCase()}/profile`);
    }
  }, [session]);
  useEffect(() => {
    const fn = async () => {
      const resp = await fetchEnterpriseInfo();
      console.log('response we got ', resp);
      if (resp.data) {
        const inf = await JSON.parse(resp.data);
        setEnt(inf);
        console.log(ent);
      }
      if (!resp.success) {
        toast.error(
          `Failed to load enterprise details, Please Reload or try later. ERROR : ${resp.error}`
        );
      }
    };
    fn();
  }, []);
  const onSubmit: SubmitHandler<FormFields> = async (data: FormFields) => {
    try {
      console.warn(data);
      localStorage.setItem('phone', data.phoneNo);
      const res = await signIn(
        'credentials',
        {
          phoneNo: data.phoneNo,
          password: data.password,
          redirect: false,
          // callbackUrl: '/admin/employees'//This was a good option . the only problem was that its shwoign invalid credentials
        }
        // { callbackUrl: '/admin/employees' }
      );
      console.log('wowoowowoowowowow', res);
      console.log(data);
      if (res?.ok) {
        form.reset({
          password: '',
          phoneNo: '',
        });
        toast.success('Logged in.');
      }
      if (!res?.ok) {
        return toast.error('Invalid credentials');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <section className=' h-[91.5vh] flex justify-center items-center overflow-hidden'>
      <div className='h-full w-[70%] flex flex-col'>
        <Image
          src={excavator}
          alt='vehicles'
          width={200}
          height={200}
          quality={100}
          className='w-full h-full object-cover -scale-x-100'
          placeholder='blur'
          blurDataURL='data:image/jpeg;base64,...'
        />
      </div>
      <div className='h-full w-[30%] flex items-stretch justify-stretch'>
        <Image
          height={200}
          width={200}
          className='h-full w-full object-cover'
          src={truck_crane}
          alt='vehicles'
          quality={100}
          placeholder='blur'
          blurDataURL='data:image/jpeg;base64,...'
        />
      </div>
      <div className='z-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 space-y-4 md:space-y-6 sm:p-8 border-[1px] border-blue-500 bg-blue-50 shadow-lg rounded-sm flex flex-col gap-3'>
        <div className='flex flex-col justify-center items-center gap-3'>
          <Image
            src={'/assets/logo.png'}
            width={50}
            height={50}
            alt='sign image'
          />{' '}
          {ent?.name ? (
            <h1 className='text-3xl font-bold leading-tight tracking-tight text-blue-500 md:text-2xl font-mono'>
              {ent?.name}
            </h1>
          ) : (
            <h1 className='text-sm font-bold leading-tight tracking-tight text-red-500 font-mono'>
              No Company Name found. Try by Reloading
            </h1>
          )}
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className=' rounded-md flex flex-col gap-6 mt-4'
          >
            {/* <h2 className=' bg-primary-color-extreme/10 text-center py-1 text-base   relative   '>
  Shekhar Enterprises
</h2> */}
            {/* <div className='flex flex-col'>  */}

            <FormField
              control={form.control}
              name='phoneNo'
              render={({ field }) => (
                <FormItem className=' flex-col flex gap-1 flex-1'>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    {field.value ? (
                      <Input
                        placeholder=''
                        {...field}
                        className=' bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                        type='number'
                      />
                    ) : (
                      <Input
                        placeholder='Enter phone no.'
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
              name='password'
              render={({ field }) => (
                <FormItem className=' flex-col flex gap-1 flex-1'>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    {field.value ? (
                      <Input
                        placeholder=''
                        {...field}
                        className=' bg-white '
                        type='password'
                      />
                    ) : (
                      <Input
                        placeholder='Enter your password'
                        {...field}
                        className=' bg-white '
                      />
                    )}
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* </div> */}
            <div className='flex items-center justify-center py-4 '>
              <Button
                type='submit'
                className=' bg-blue-500 w-full rounded-md text-white'
              >
                {' '}
                {form.formState.isSubmitting && (
                  <Loader2 className='h-4 w-4 animate-spin' />
                )}
                <>Sign In</>
              </Button>
            </div>
          </form>
        </Form>
      </div>
      <div className='absolute top-0 bottom-0 left-0 right-0 bg-black opacity-30'></div>
    </section>
  );
};

export default LoginForm;
