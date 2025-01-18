'use client';
import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import EmployeeDataAction from '@/lib/actions/HR/EmployeeData/employeeDataAction';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

const secSchema = z.object({
  employee: z.string().trim().min(1, 'Required'),
});

type SecondFormFields = z.infer<typeof secSchema>;

const Page = () => {
  const secForm = useForm<SecondFormFields>({
    defaultValues: {
      employee: '',
    },
    resolver: zodResolver(secSchema),
  });

  const [employees, setEmployees] = useState([]);

  const [checkboxStatus, setCheckboxStatus] = useState(false);

  const handleToggle = (e) => {
    const status = e.target.checked;
    setCheckboxStatus(status);
  };

  const onEmployeeSubmit: SubmitHandler<SecondFormFields> = async (
    data: SecondFormFields,
    event
  ) => {
    try {
      const query = {
        employee: data.employee,
        ...(checkboxStatus && { Retrenchment_benefit: '15' }),
      };

      const queryString = new URLSearchParams(query).toString();
      // @ts-ignore
      const action = event.nativeEvent.submitter.value; // get the button value

      if (action === 'normal_order') {
        window.open(
          `/hr/final-settlement/normal-finalsettlement?${queryString}`,
          '_blank'
        );
      } else {
        window.open(
          `/hr/final-settlement/reverse-finalsettlement?${queryString}`,
          '_blank'
        );
      }
    } catch (error) {
      toast.error('Internalll Server Error');
      console.error('Internal Server Error:', error);
    }
  };

  useEffect(() => {
    const fn = async () => {
      try {
        console.log('wowoowowow');
        const response = await EmployeeDataAction.FETCH.fetchAllEmployeeData();

        console.log(response);
        if (response?.success) {
          const responseData = await JSON.parse(response.data);
          console.log('sahi response', responseData);
          setEmployees(responseData);
        } else {
          console.log(response.message);
        }
      } catch (err) {
        toast.error('Internal Serveeer Error');
        console.log('Internal Serveeer Error:', err);
      }
    };
    fn();
  }, []);

  return (
    <section className=''>
      <h1 className='font-bold text-blue-500 border-b-2 border-blue-500 text-center py-2 mb-4'>
        Full & Final
      </h1>

      <div className='mx-auto flex flex-col w-1/2'>
        <Form {...secForm}>
          <form
            onSubmit={secForm.handleSubmit(onEmployeeSubmit)}
            className='border-[1px] border-gray-300 rounded-md shadow-lg flex flex-col gap-2 '
          >
            <div className='flex flex-col md:flex-row p-3 gap-2'>
              <FormField
                control={secForm.control}
                name='employee'
                render={({ field }) => (
                  <FormItem className=' flex-col flex gap-1 flex-1'>
                    <FormLabel>Select Employee</FormLabel>
                    <Select
                      onValueChange={(e) => {
                        field.onChange(e);
                        // setWorkOrderNumber(e)
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          {field.value ? (
                            <SelectValue placeholder='' />
                          ) : (
                            'Select Employee'
                          )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='max-w-80 max-h-72'>
                        {employees?.map((option, index) => (
                          <SelectItem
                            value={option._id.toString()}
                            key={option._id.toString()}
                          >
                            {option.name.toString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='py-4'>
                <label className='inline-flex items-center cursor-pointer gap-2'>
                  <input
                    type='checkbox'
                    className='sr-only peer'
                    checked={checkboxStatus}
                    onChange={handleToggle}
                  />
                  <span className='ms-3 text-sm font-medium text-gray-900 dark:text-gray-300 mr-2'>
                    Retrenchment benefit :
                  </span>
                  <div
                    className={`relative w-11 h-6 bg-gray-200  dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full  after:content-[''] after:absolute after:top-[1px] after:start-[2px]  after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 ${
                      !checkboxStatus ? 'border-[0.5px] border-gray-600' : ''
                    }`}
                  ></div>
                </label>
              </div>
            </div>

            <div className='p-4 flex flex-col md:flex-row gap-1 justify-center items-center'>
              <Button
                type='submit'
                value='normal_order'
                className='flex items-center gap-1 border-2 px-4 rounded'
              >
                {secForm.formState.isSubmitting && (
                  <Loader2 className='h-4 w-4 animate-spin' />
                )}
                <>Generate FINAL SETTLEMENT</>
              </Button>
              <Button
                type='submit'
                value='reverse_order'
                className='flex items-center gap-1 border-2 px-4 rounded'
              >
                {secForm.formState.isSubmitting && (
                  <Loader2 className='h-4 w-4 animate-spin' />
                )}
                <>Generate REVERSE FINAL SETTLEMENT</>
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </section>
  );
};

export default Page;
