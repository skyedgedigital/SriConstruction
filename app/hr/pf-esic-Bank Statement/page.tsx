'use client'
import { useState, useEffect } from 'react';
import { fetchAllAttendance } from '@/lib/actions/attendance/fetch';
import { wagesColumns } from '@/components/hr/WagesColumn';
import ReactDOMServer from 'react-dom/server';
import html2canvas from 'html2canvas';
import { useRouter } from 'next/navigation';
import wagesAction from '@/lib/actions/HR/wages/wagesAction';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autotable from 'jspdf-autotable'
import { DataTable } from '@/components/data-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
  SelectGroup
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableFooter
  } from "@/components/ui/table"
import employeeAction from '@/lib/actions/employee/employeeAction';
import EmployeeDataAction from '@/lib/actions/HR/EmployeeData/employeeDataAction';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import attendanceAction from '@/lib/actions/attendance/attendanceAction';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form"
  import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler} from "react-hook-form";
import { z} from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import vehicleAction from '@/lib/actions/vehicle/vehicleAction';
import WorkOrderHrAction from '@/lib/actions/HR/workOrderHr/workOrderAction';
import departmentHrAction from '@/lib/actions/HR/DepartmentHr/departmentHrAction';
import EsiLocationAction from '@/lib/actions/HR/EsiLocation/EsiLocationAction';


const schema = z.object({
   year:  z.string().trim().min(1,"Required"), 
month:z.string().trim().min(1,"Required"), 
department:z.string().trim().min(1,"Required"), 


   
  });


  const secSchema = z.object({
  
    year:  z.string().trim().min(1,"Required"), 
    month:z.string().trim().min(1,"Required"), 
    esilocation:z.string().trim().min(1,"Required")
   
   
  });

  const thirdSchema = z.object({
  
    year:  z.string().trim().min(1,"Required"), 
    month:z.string().trim().min(1,"Required"), 
    workOrder:z.string().trim().min(1,"Required"),
    department:z.string().trim().min(1,"Required"), 

   
  });

  const fourthSchema = z.object({
    year:  z.string().trim().min(1,"Required"), 
 //    month:z.string().trim().min(1,"Required"), 
 
 workOrder: z.string().trim().min(1,"Required")
    
   });
  
  type SecondFormFields = z.infer<typeof secSchema>;
  type ThirdFormFields = z.infer<typeof thirdSchema>;
  type FourthFormFields = z.infer<typeof fourthSchema>;

  

  type FormFields = z.infer<typeof schema>;
const Page=()=>{
const router=useRouter()
    const form = useForm<FormFields>({
        defaultValues: {
          year:'',
           month: '',
           department:"All Departments"
     
          
     
      
        },
        resolver: zodResolver(schema),
    
      });
      const fourthForm = useForm<FourthFormFields>({
        defaultValues: {
          year:'',
           workOrder: ''
     
          
     
      
        },
        resolver: zodResolver(fourthSchema),
    
      });


      const thirdform = useForm<ThirdFormFields>({
        defaultValues: {
          year:'',
           month: '',
           department:"All Departments",
           workOrder:"Default"
     
          
     
      
        },
        resolver: zodResolver(thirdSchema),
    
      });
      const [workOrderNumber,setWorkOrderNumber]=useState<any>(null)
      
      const [departments,setDepartments]=useState([])
      const [esis,setEsis]=useState([])

      useEffect(() => {
        const fn = async () => {
      
      try  { 
        console.log("wowoowowow")
         const response =await EsiLocationAction.FETCH.fetchEsiLocation();
          
            console.log(response);
          if(response.success)  { 
            const responseData=await JSON.parse(response.data)
            console.log("sahi response", responseData)
            setEsis(responseData)
                
              }else {
      console.log(response.message)
                }
      }catch(err)
      {
        toast.error('Internal Serveeer Error')
        console.log('Internal Serveeer Error:', err);
      }
        };
        fn();
      }, [])

      useEffect(() => {
        const fn = async () => {
      
      try  { 
        console.log("wowoowowow")
         const response =await departmentHrAction.FETCH.fetchDepartmentHr();
          
            console.log(response);
          if(response.success)  { 
            const responseData=await JSON.parse(response.data)
            console.log("sahi response", responseData)
            setDepartments(responseData)
                
              }else {
      console.log(response.message)
                }
      }catch(err)
      {
        toast.error('Internal Serveeer Error')
        console.log('Internal Serveeer Error:', err);
      }
        };
        fn();
      }, []);

      const secForm = useForm<SecondFormFields>({
        defaultValues: {
        
     year:'',
           month: '',
           esilocation:"All Esi Locations"
          
     
      
        },
        resolver: zodResolver(secSchema),
    
      });

      const [employees,setEmployees]=useState([])
      const [attendanceData, setAttendanceData] = useState(null);
      const [sattendanceData, setSAttendanceData] = useState(null);

      const [attendance, setAttendance] = useState(null);

      const [employeeData, setEmployeeData]=useState(null)

      const [wagesData, setWagesData]=useState(null)

      const [year,setYear]=useState(null)
      const [month,setMonth]=useState(null)


    
      const years = Array.from({ length: 2024 - 2010 + 1 }, (_, i) => 2010 + i);
      const months = Array.from({ length: 12 }, (_, i) => i + 1);


const onEmployeeSubmit: SubmitHandler<SecondFormFields> = async (data:SecondFormFields) => {
  try {
    // console.log("yeich hai second form data", event)
       const query = { year: data.year, month: data.month,esi:data.esilocation };
       const queryString = new URLSearchParams(query).toString();
       // @ts-ignore
      // 
 window.open(`/hr/esic?${queryString}`,'_blank');
        
      } catch (error) {
        toast.error('Internalll Server Error')
        console.error('Internal Server Error:', error);
    
      } 
};


const onYearSubmit: SubmitHandler<FormFields> = async (data:FormFields,event) => {
  try {
    // console.log("yeich hai second form data", event)
       const query = { year: data.year, month: data.month, dept:data.department };
       const queryString = new URLSearchParams(query).toString();
       // @ts-ignore
      // 
 window.open(`/hr/pf?${queryString}`,'_blank');
        
      } catch (error) {
        toast.error('Internalll Server Error')
        console.error('Internal Server Error:', error);
    
      } 
};

const onBankSubmit: SubmitHandler<ThirdFormFields> = async (data:ThirdFormFields,event) => {
  try {
    // console.log("yeich hai second form data", event)
       const query = { year: data.year, month: data.month, dept:data.department,wo:data.workOrder };
       const queryString = new URLSearchParams(query).toString();
       // @ts-ignore
      // 
 window.open(`/hr/bank-statement?${queryString}`,'_blank');
        
      } catch (error) {
        toast.error('Internalll Server Error')
        console.error('Internal Server Error:', error);
    
      } 
};


useEffect(() => {
  const fn = async () => {

try  { 
  console.log("wowoowowow")
   const response =await EmployeeDataAction.FETCH.fetchAllEmployeeData();
    
      console.log(response);
    if(response.success)  { 
      const responseData=await JSON.parse(response.data)
      console.log("sahi response", responseData)
      setEmployees(responseData)
          
        }else {
console.log(response.message)
          }
}catch(err)
{
  toast.error('Internal Serveeer Error')
  console.log('Internal Serveeer Error:', err);
}
  };
  fn();
}, []);

const [allWorkOrderNumbers, setAllWorkOrderNumbers] = useState([]);


useEffect(() => {
  const fetch = async () => {
    // const { data, success, error } =
    //   await workOrderAction.FETCH.fetchAllWorkOrder();

    const workOrderResp = await WorkOrderHrAction.FETCH.fetchAllWorkOrderHr();
    const success = workOrderResp.success
    // const error = workOrderResp.error
    // const data = JSON.parse(workOrderResp.data)
      

    if (success) {
      const workOrderNumbers = JSON.parse(workOrderResp.data)
      setAllWorkOrderNumbers(workOrderNumbers)
      console.log("yeraaaa wowowowwoncjd",workOrderNumbers)
    } else {
      toast.error( 'Can not fetch work order numbers!');
    }
  };
  fetch();
}, []);

const monthsName = [
  "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"
]
      
const onBonusSubmit: SubmitHandler<FourthFormFields> = async (data:FourthFormFields,event) => {
  try {
   console.log(workOrderNumber)
// console.log("yeich hai second form data", event)
const filter = JSON.stringify({ _id: data.workOrder });
const result=await WorkOrderHrAction.FETCH.fetchSingleWorkOrderHr(filter)
const dat=JSON.parse(result.data)
console.log("yera data", dat)
   const query = { year: data.year,wog:dat.workOrderNumber,wo:data.workOrder };
   const queryString = new URLSearchParams(query).toString();

  // 
 window.open(`/hr/bonus-statement?${queryString}`,'_blank')
    
  } catch (error) {
    toast.error('Internalll Server Error')
    console.error('Internal Server Error:', error);

  } 
};

      
return(
    <div className='ml-[80px]'>
    <Form {...form}
      >
        <form onSubmit={form.handleSubmit(onYearSubmit)} className="space-y-2 px-2 mr-2 border-2 border-black rounded-md bg-slate-200">


<FormField
    control={form.control}
    name= "year"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Year</FormLabel>
        <Select onValueChange={(e)=>
 {     field.onChange(e);
    // setWorkOrderNumber(e)
  }
    } value={field.value}>
                

        <FormControl>
        <SelectTrigger>
        {field.value ? <SelectValue placeholder="" /> : "Select Year"}
                    </SelectTrigger>   

                 </FormControl>
                        <SelectContent className='max-w-80 max-h-72'>
             
{years?.map((option,index)=>
                    <SelectItem value={option.toString()} key={option}>{option.toString()}</SelectItem>

)}
                </SelectContent>
              </Select>
        <FormMessage />
      </FormItem>
    )}
  />  
   
   <FormField
    control={form.control}
    name= "month"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Month</FormLabel>
        <Select onValueChange={(e)=>
 {     field.onChange(e);
    // setWorkOrderNumber(e)
  }
    } value={field.value}>
                

        <FormControl>
        <SelectTrigger>
        {field.value ? <SelectValue placeholder="" /> : "Select Month"}
                    </SelectTrigger>   

                 </FormControl>
                        <SelectContent className='max-w-80 max-h-72'>
             
{months?.map((option,index)=>
                    <SelectItem value={option.toString()} key={option}>{monthsName[option-1]}</SelectItem>

)}
                </SelectContent>
              </Select>
        <FormMessage />
      </FormItem>
    )}
  />  
  <FormField
    control={form.control}
    name= "department"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Department</FormLabel>
        <Select onValueChange={(e)=>
 {     field.onChange(e);
    //setWorkOrderNumber(e)
  }
    } value={field.value}>
                

        <FormControl>
        <SelectTrigger>
        <SelectValue placeholder="Select Department" /> 
                            </SelectTrigger>   

                 </FormControl>
                        <SelectContent className='max-w-80 max-h-72'>
                        <SelectItem value="All Departments">All Departments</SelectItem>

{departments?.map((option,index)=>
                    <SelectItem value={option._id.toString()} key={option}>{option.name}</SelectItem>

)}
                </SelectContent>
              </Select>
        <FormMessage />
      </FormItem>
    )}
  />
  <div className='py-4 '>
         
       
         <Button
         type='submit'
      
                     className='flex items-center gap-1 border-2 px-4 rounded'
     
         >
      {form.formState.isSubmitting &&  <Loader2 className="h-4 w-4 animate-spin" />}
           <>Generate PFfffff</>
         </Button>
     </div>
      </form>   
      </Form>

  <div className='mt-8 flex flex-col '>   



<Form {...secForm}
>
  <form onSubmit={secForm.handleSubmit(onEmployeeSubmit)} className="space-y-2 px-2 mr-2 border-2 border-black rounded-md bg-slate-200">


 
  <FormField
    control={secForm.control}
    name= "year"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Year</FormLabel>
        <Select onValueChange={(e)=>
 {     field.onChange(e);
    // setWorkOrderNumber(e)
  }
    } value={field.value}>
                

        <FormControl>
        <SelectTrigger>
        {field.value ? <SelectValue placeholder="" /> : "Select Year"}
                    </SelectTrigger>   

                 </FormControl>
                        <SelectContent className='max-w-80 max-h-72'>
             
{years?.map((option,index)=>
                    <SelectItem value={option.toString()} key={option}>{option.toString()}</SelectItem>

)}
                </SelectContent>
              </Select>
        <FormMessage />
      </FormItem>
    )}
  /> 

<FormField
    control={secForm.control}
    name= "month"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Month</FormLabel>
        <Select onValueChange={(e)=>
 {     field.onChange(e);
    // setWorkOrderNumber(e)
  }
    } value={field.value}>
                

        <FormControl>
        <SelectTrigger>
        {field.value ? <SelectValue placeholder="" /> : "Select Month"}
                    </SelectTrigger>   

                 </FormControl>
                        <SelectContent className='max-w-80 max-h-72'>
             
{months?.map((option,index)=>
                    <SelectItem value={option.toString()} key={option}>{monthsName[option-1]}</SelectItem>

)}
                </SelectContent>
              </Select>
        <FormMessage />
      </FormItem>
    )}
  />  
   <FormField
    control={secForm.control}
    name= "esilocation"
    render={({ field }) => (
      <FormItem>
        <FormLabel>ESI Location</FormLabel>
        <Select onValueChange={(e)=>
 {     field.onChange(e);
    //setWorkOrderNumber(e)
  }
    } value={field.value}>
                

        <FormControl>
        <SelectTrigger>
     <SelectValue placeholder="Select ESI Location" /> 
                    </SelectTrigger>   

                 </FormControl>
                        <SelectContent className='max-w-80 max-h-72'>
                        <SelectItem value="All Esi Locations">All Esi Locations</SelectItem>

{esis?.map((option,index)=>
                    <SelectItem value={option._id.toString()} key={option}>{option.name.toString()}</SelectItem>

)}
                </SelectContent>
              </Select>
        <FormMessage />
      </FormItem>
    )}
  />
        <div className='py-4 '>
         
            
              <Button
              type='submit'
              className='flex items-center gap-1 border-2 px-4 rounded'
          
              >
           {form.formState.isSubmitting &&  <Loader2 className="h-4 w-4 animate-spin" />}
                <>Generate ESIC</>
              </Button>
           
          </div>
      </form>   
      </Form>         
            
          
            </div>
            <div className='mt-8 flex flex-col '>   

            <Form {...thirdform}
      >
        <form onSubmit={thirdform.handleSubmit(onBankSubmit)} className="space-y-2 px-2 mr-2 border-2 border-black rounded-md bg-slate-200">


<FormField
    control={thirdform.control}
    name= "year"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Year</FormLabel>
        <Select onValueChange={(e)=>
 {     field.onChange(e);
    // setWorkOrderNumber(e)
  }
    } value={field.value}>
                

        <FormControl>
        <SelectTrigger>
        {field.value ? <SelectValue placeholder="" /> : "Select Year"}
                    </SelectTrigger>   

                 </FormControl>
                        <SelectContent className='max-w-80 max-h-72'>
             
{years?.map((option,index)=>
                    <SelectItem value={option.toString()} key={option}>{option.toString()}</SelectItem>

)}
                </SelectContent>
              </Select>
        <FormMessage />
      </FormItem>
    )}
  />  
   
   <FormField
    control={thirdform.control}
    name= "month"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Month</FormLabel>
        <Select onValueChange={(e)=>
 {     field.onChange(e);
    // setWorkOrderNumber(e)
  }
    } value={field.value}>
                

        <FormControl>
        <SelectTrigger>
        {field.value ? <SelectValue placeholder="" /> : "Select Month"}
                    </SelectTrigger>   

                 </FormControl>
                        <SelectContent className='max-w-80 max-h-72'>
             
{months?.map((option,index)=>
                    <SelectItem value={option.toString()} key={option}>{monthsName[option-1]}</SelectItem>

)}
                </SelectContent>
              </Select>
        <FormMessage />
      </FormItem>
    )}
  />  
  <FormField
    control={thirdform.control}
    name= "department"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Department</FormLabel>
        <Select onValueChange={(e)=>
 {     field.onChange(e);
    //setWorkOrderNumber(e)
  }
    } value={field.value}>
                

        <FormControl>
        <SelectTrigger>
        <SelectValue placeholder="Select Department" /> 
                            </SelectTrigger>   

                 </FormControl>
                        <SelectContent className='max-w-80 max-h-72'>
                        <SelectItem value="All Departments">All Departments</SelectItem>

{departments?.map((option,index)=>
                    <SelectItem value={option._id.toString()} key={option}>{option.name}</SelectItem>

)}
                </SelectContent>
              </Select>
        <FormMessage />
      </FormItem>
    )}
  />
  <FormField
    control={thirdform.control}
    name= "workOrder"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Work Order</FormLabel>
        <Select onValueChange={(e)=>
 {     field.onChange(e);
  //setWorkOrderNumber(e)

  }
    } value={field.value}>
                

        <FormControl>
        <SelectTrigger>
        {field.value ? <SelectValue placeholder="" /> : "Select Work Order No."}
                    </SelectTrigger>   

                 </FormControl>
                        <SelectContent className='max-w-80 max-h-72'>
                        <SelectItem value="Default" key="Default">Default</SelectItem>

{allWorkOrderNumbers?.map((option,index)=>
                    <SelectItem value={option._id.toString()} key={option}>{option.workOrderNumber}</SelectItem>

)}
                </SelectContent>
              </Select>
        <FormMessage />
      </FormItem>
    )}
  />
  
  <div className='py-4 '>
         
       
         <Button
         type='submit'
      
                     className='flex items-center gap-1 border-2 px-4 rounded'
     
         >
      {thirdform.formState.isSubmitting &&  <Loader2 className="h-4 w-4 animate-spin" />}
           <>Generate Bank Statement</>
         </Button>
     </div>
      </form>   
      </Form>
</div>
<div className='mt-8 flex flex-col '>   

<Form {...fourthForm}
      >
        <form onSubmit={fourthForm.handleSubmit(onBonusSubmit)} className="space-y-2 px-2 mr-2 border-2 border-black rounded-md bg-slate-200">


  <FormField
    control={fourthForm.control}
    name= "year"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Year</FormLabel>
        <Select onValueChange={(e)=>
 {     field.onChange(e);
    // setWorkOrderNumber(e)
  }
    } value={field.value}>
                

        <FormControl>
        <SelectTrigger>
        {field.value ? <SelectValue placeholder="" /> : "Select Year"}
                    </SelectTrigger>   

                 </FormControl>
                        <SelectContent className='max-w-80 max-h-72'>
             
{years?.map((option,index)=>
                    <SelectItem value={option.toString()} key={option}>{option.toString()}</SelectItem>

)}
                </SelectContent>
              </Select>
        <FormMessage />
      </FormItem>
    )}
  />  
   <FormField
    control={fourthForm.control}
    name= "workOrder"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Work Order</FormLabel>
        <Select onValueChange={(e)=>
 {     field.onChange(e);
    setWorkOrderNumber(e)
  }
    } value={field.value}>
                

        <FormControl>
        <SelectTrigger>
        {field.value ? <SelectValue placeholder="" /> : "Select Work Order No."}
                    </SelectTrigger>   

                 </FormControl>
                        <SelectContent className='max-w-80 max-h-72'>
             
{allWorkOrderNumbers?.map((option,index)=>
                    <SelectItem value={option._id.toString()} key={option}>{option.workOrderNumber}</SelectItem>

)}
                </SelectContent>
              </Select>
        <FormMessage />
      </FormItem>
    )}
  />
  
  <div className='py-4 '>
         
         <Button
           type='submit'
           className='flex items-center gap-1 border-2 px-4 mb-2 rounded'
        
         >
           {fourthForm.formState.isSubmitting &&  <Loader2 className="h-4 w-4 animate-spin" />}
           <>Generate BONUS STATEMENT</>
         </Button>
         
     </div>
      </form>   
      </Form>
      </div>

      </div>)   }

export default Page;