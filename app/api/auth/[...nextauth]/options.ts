import Admin from '@/lib/models/admin.model';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compareSync } from "bcrypt-ts";
import connectToDB  from '@/lib/database';
import User from '@/lib/models/user.model';
import Employee from '@/lib/models/employee.model';
import { IAdmin, IUser } from '@/interfaces/user.interface';
import { IEmployee } from '@/interfaces/employee.interface';


export const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                phoneNo: { label: 'phoneNo', type: 'number' },
                password: { label: 'password', type: 'string' },
            },
            async authorize(credentials: any): Promise<any> {
                try {
                    connectToDB()
                    // Check admin first
                    let admin: IAdmin | null, isPasswordMatching: boolean;
                    admin = await Admin.findOne({ phoneNo: credentials?.phoneNo })
                    if (admin) {
                        isPasswordMatching = compareSync(credentials?.password, admin.hashedpassword)
                        if (isPasswordMatching) {
                            return {
                                _id: admin._id.toString(),
                                name: admin.name,
                                phoneNo: admin.phoneNo,
                                access: admin.access
                            }
                        } else {
                            throw new Error("Incorrect phoneNo/password")
                        }
                    }
                    let user: IUser
                    // check employees
                    user = await Employee.findOne({ phoneNo: credentials?.phoneNo })
                   
                    if (!user) {
                        throw new Error('User not found'); // Notify frontend: User not found
                    }
                    let employeeId = user._id
                    user = await User.findOne({ employee: employeeId }).populate<{ employee: IEmployee }>('employee')
                    if (!user) {
                        throw new Error('User not found'); // Notify frontend: User not found
                    }
                    console.log(user.hashedpassword)
                    isPasswordMatching = compareSync(credentials?.password, user.hashedpassword)
                    if(isPasswordMatching)
              {          
                    return {
                        _id: user._id,
                        employee: user.employee,
                        access: user.access
                    }
}

else {
    throw new Error("Incorrect phoneNo/password")
}
                } catch (error) {
                    console.log(error)
                    return null
                }
            },
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            session.user.access = token.access;
            if (token.access == "ADMIN") {
                session.user.phoneNo = token.phoneNo,
                session.user.name = token.name,
                session.user._id = token._id
            } else {
                session.user.employee = token.employee
                session.user._id = token._id
            }
            return session
        },
        async jwt({ user, token }) {
            if (user) {
                token.access = user.access;
                if (token.access === "ADMIN") {
                    token.phoneNo = user.phoneNo;
                    token.name = user.name;
                    token._id = user._id.toString();
                } else {
                    token._id = user._id.toString();
                    token.employee = user.employee
                }
            }
            return token
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === "development",
    pages: {
        signIn: '/auth/login',
    },
};
