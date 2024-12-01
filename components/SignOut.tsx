'use client'
import React from 'react'
import { Button } from "./ui/button";
import { useSession, signOut } from "next-auth/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


function SignOut() {

    const session = useSession();
    const handleSignOut =  async() => {

       await signOut({ callbackUrl: '/auth/login', redirect:true });
    
      };

  return (
    <>
    {session?.data && (  
    <div className="ml-auto flex gap-2 lg:mr-12">
            
     <div
      className="group inline-flex h-9 w-max items-center justify-center rounded-md  px-4 py-2 text-sm font-medium transition-colors bg-gray-100 text-gray-900"
      
    >
     { `Logged in as: ${session?.data?.user?.access}`}
    </div>
    <AlertDialog >
      <AlertDialogTrigger asChild className='' >
         <Button  className="justify-self-end px-2 py-1 text-xs" variant="outline">
      Sign out
    </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure you want to sign out?</AlertDialogTitle>
          {/* <AlertDialogDescription>
        This action cannot be undone. This will permanently delete your account
        and remove your data from our servers.
      </AlertDialogDescription> */}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSignOut}>Yes</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
 

   
  </div> 
)}
  </>
  )
}

export default SignOut
