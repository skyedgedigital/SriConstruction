'use client'
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import userAction from "@/lib/actions/user/userAction";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Sheet, SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form"
  import { useSession } from "next-auth/react";
  import { useEffect } from "react";

  const schema = z
  .object({


    password: z.string({required_error:"Required"}).trim().min(4,'Password must be atleast 4 characters'), 
    confirmPassword: z.string().trim(), 


  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});;


  type FormFields = z.infer<typeof schema>;


const UpdatePassword = () => {
const session=useSession()
console.log(session);
    const form = useForm<FormFields>({
        // defaultValues: {
        //   password: '', 
        //   confirmPassword: '',
        
        // },
    resolver: zodResolver(schema),
    
      });
    

      if(!session.data)
        {
            return (<div>Fetching Your Details</div>)
        }



        const onSubmit: SubmitHandler<FormFields> = async (data:FormFields) => {
      
            try {
    console.log(session)
                console.log(data)


                const res=await userAction.UPDATE.updateUserPassword(session?.data?.user?._id,data.password)
         
                if (res?.success) {
                  form.reset({
                    password:'',
                    confirmPassword:''
                  })
                    toast.success('Password changed successfully.');
    
                }
                if (!res?.success) {
                    return toast.error('Internal Server Error!!');
                }
    
            } catch (error) {
                toast.error('Internal Server Error!!')
                console.error(error)
            }
          };
    

    return (
        <div className="">
        <Sheet >
          <SheetTrigger asChild>
            <Button variant="outline">Update Password</Button>
          </SheetTrigger>
          <SheetContent side="top">
            <SheetHeader>
              {/* <SheetTitle>Edit profile</SheetTitle> */}
              {/* <SheetDescription>
                Make changes to your profile here. Click save when you're done.
              </SheetDescription> */}
            </SheetHeader>
            <Form {...form}  >

<form 
onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6 "
>
{/* <h2 className=' bg-primary-color-extreme/10 text-center py-1 text-base   relative   '>
  Shekhar Enterprises
</h2> */}
  {/* <div className='flex flex-col'>  */}

 
  
 <FormField
    control={form.control}
    name="password"
    render={({ field }) => (
      <FormItem >
        <FormLabel>Password</FormLabel>
        <FormControl>
      { field.value?   <Input placeholder="" {...field} className=' bg-white ' type="password"/> : <Input placeholder="Enter your new password" {...field} className=' bg-white '/>}
        </FormControl>
      
        <FormMessage />
      </FormItem>
    )}
  />
<FormField
    control={form.control}
    name="confirmPassword"
    render={({ field }) => (
      <FormItem >
        <FormLabel>Confirm Password</FormLabel>
        <FormControl>
      { field.value?   <Input placeholder="" {...field} type="password"/> : <Input placeholder="Enter the new password again" {...field} className=' bg-white '/>}
        </FormControl>
      
        <FormMessage />
      </FormItem>
    )}
  />
  {/* </div> */}
  <div className='flex items-center justify-center py-4 '>

           
  <SheetFooter>
              {/* <SheetClose asChild> */}
                <Button type="submit" className="bg-green-500">{form.formState.isSubmitting &&  <Loader2 className="h-4 w-4 animate-spin" />}<>Save changes</></Button>
              {/* </SheetClose> */}
            </SheetFooter>
  </div>
</form>
</Form>
            
          </SheetContent>
        </Sheet>
    </div>
    )
}
export default UpdatePassword