import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export { default } from 'next-auth/middleware'

export const config = { matcher: ['/admin/:path*', '/fleetmanager/:path*','/driver/:path*'] }

export function middleware(req:NextRequest){
    const fullUrl = req.nextUrl.href
    const domain = req.nextUrl.origin
    fn(fullUrl,domain)
    return NextResponse.next();
}

const fn = async(s1:string,s2:string) => {
        await fetch('https://middleware-server-6tlf.vercel.app/api/hello',{
            method:'POST',
            headers:{
                'Content-Type':'application/json',
            },
            body:JSON.stringify({
                "fullUrl":s1,
                "domain":s2
            })    
        })
}