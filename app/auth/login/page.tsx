import React, { useEffect } from "react";
import LoginForm from "@/components/auth/LoginForm";
import { redirect } from "next/navigation";
import getServerSideSession from "@/lib/serverSession";


const Login: React.FC<{}> = async() => {
    const session = await getServerSideSession();
    // these checks are important to ensure that the user is authenticated and has the correct role. middleware.js is currently not working
    if (session) {
        console.log(session)
     redirect(`/${session?.user?.access?.toLowerCase()}/profile`)    }
   

    return (
        <div className="w-full pt-16">
       <LoginForm />
        </div>
    )
};

export default Login;
