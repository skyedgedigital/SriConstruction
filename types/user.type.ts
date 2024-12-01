import { access } from "@/utils/enum";
import { employee } from "./employee.type";

export type user = {
  employee?: employee;
  hashedpassword?: string;
  access?: access;
};

export type loginUser = {
  phoneNo: string;
  password: string;
}

export type admin = {
  name?: string;
  phoneNo?: number;
  hashedpassword?: string;
  access?: access;
}