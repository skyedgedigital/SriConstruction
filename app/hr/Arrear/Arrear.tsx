"use client";
import { useState, useEffect } from "react";
import { fetchAllAttendance } from "@/lib/actions/attendance/fetch";
import { fetchAllDepAttendance } from "@/lib/actions/attendance/fetch";
import { wagesColumns } from "@/components/hr/WagesColumn";
import ReactDOMServer from "react-dom/server";
import html2canvas from "html2canvas";
import { useRouter, useSearchParams } from "next/navigation";
import wagesAction from "@/lib/actions/HR/wages/wagesAction";
import Link from "next/link";
import jsPDF from "jspdf";
import autotable from "jspdf-autotable";
import { DataTable } from "@/components/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
  SelectGroup,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import employeeAction from "@/lib/actions/employee/employeeAction";
import EmployeeDataAction from "@/lib/actions/HR/EmployeeData/employeeDataAction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import attendanceAction from "@/lib/actions/attendance/attendanceAction";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import vehicleAction from "@/lib/actions/vehicle/vehicleAction";
import departmentHrAction from "@/lib/actions/HR/DepartmentHr/departmentHrAction";
import { fetchEmployeeByDep } from "@/lib/actions/HR/EmployeeData/fetch";
import WorkOrderHrAction from "@/lib/actions/HR/workOrderHr/workOrderAction";
import { fetchAllEmployees } from "@/lib/actions/employee/fetch";
import { set } from "mongoose";
import designationAction from "@/lib/actions/HR/Designation/designationAction";

const schema = z.object({
  FromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  ToDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  workOrder: z.string().trim().min(0, "Required"),
  // Designation: z.string().trim().min(0, "Required"),
  DA: z.boolean().optional(),
});

type FormFields = z.infer<typeof schema>;

const Arrear = () => {
  const router = useRouter();
  const form = useForm<FormFields>({
    resolver: zodResolver(schema),
  });
  const [workOrderNumber, setWorkOrderNumber] = useState<any>(null);
  const [employeesData, setEmployeesData] = useState([]);
  const [aaction, setAAction] = useState(null);
  const [allWorkOrderNumbers, setAllWorkOrderNumbers] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [wagesData, setWagesData] = useState([]);
  const [query, setQuery] = useState({});
  const [daAllow, setDaAllow] = useState(false);
  const [designationData, setDesignationData] = useState([]);
  const [designationState, setDesignationState] = useState(null);

  const [modifiedWages, setModifiedWages] = useState({}); // Array to store only updated wages

  useEffect(() => {
    const queryString = new URLSearchParams({
      ...query,
      modifiedWages: JSON.stringify(modifiedWages),
    }).toString();
    console.log("clicked!!", aaction);
    if (aaction && aaction === "AR") {
      window.open(`/hr/formXVII_arrear?${queryString}`, "_blank");
    } else if (aaction && aaction === "AA") {
      window.open(`/hr/formXVI_arrear?${queryString}`, "_blank");
    } else if (aaction && aaction === "ABS") {
      window.open(`/hr/Arrear_BankStatement?${queryString}`, "_blank");
    } else if (aaction && aaction === "APS") {
      window.open(`/hr/Arrear_PaySlip?${queryString}`, "_blank");
    }
    setAAction(null);
  }, [aaction]);

  // Function to handle wage changes for individual employees
  const handleWageChange = (id, newWage) => {
    setModifiedWages((prevModified) => ({
      ...prevModified,
      [id]: newWage,
    }));
  };

  const getUpdatedWage = (id, currentWage) => {
    return modifiedWages[id] !== undefined ? modifiedWages[id] : currentWage;
  };
  useEffect(() => {
    const fetch = async () => {
      // const { data, success, error } =
      //   await workOrderAction.FETCH.fetchAllWorkOrder();

      const workOrderResp = await WorkOrderHrAction.FETCH.fetchAllValidWorkOrderHr();
      const success = workOrderResp.success;
      // const error = workOrderResp.error
      // const data = JSON.parse(workOrderResp.data)

      if (success) {
        const workOrderNumbers = JSON.parse(workOrderResp.data);
        setAllWorkOrderNumbers(workOrderNumbers);
        console.log("yeraaaa wowowowwoncjd", workOrderNumbers);
      } else {
        toast.error("Can not fetch work order numbers!");
      }

      const resp = await designationAction.FETCH.fetchDesignations();
      if (resp.status === 200) {
        const ParsedData = JSON.parse(resp.data);
        console.log(ParsedData, "ParsedData");
        const DesignationArray = ParsedData.map((desg) => desg.designation);
        setDesignationData(DesignationArray);
      }
    };
    fetch();
  }, []);
  const onSubmit: SubmitHandler<FormFields> = async (
    data: FormFields,
    event
  ) => {
    try {
      if (data.FromDate < data.ToDate) {
        console.log("WorkOrder number selectrd ", workOrderNumber);
        const res = await EmployeeDataAction.FETCH.fetchAllEmployeeData();

        let depemployees;
        if (res.success) {
          depemployees = JSON.parse(res.data);
        }
        if (!depemployees || depemployees.length === 0) {
          toast.error("No employees available");
          return;
        }
        setEmployeesData(depemployees);
        console.log(
          depemployees,
          data,
          modifiedWages,
          "mein data hun & modify"
        );

        const [syear, smonth, sday] = data.FromDate.split("-").map(Number);
        const [eyear, emonth, eday] = data.ToDate.split("-").map(Number);
        let yearEdgeCase = false;

        const startDate = `${syear}-04-01`;
        const endDate = `${syear + 1}-03-31`;
        if (
          (data.FromDate >= startDate && data.ToDate <= endDate) ||
          (smonth >= 1 && emonth <= 3 && syear === eyear)
        ) {
          if (smonth >= 1 && emonth <= 3 && syear === eyear) {
            yearEdgeCase = true;
          }
          const filterdata = {
            year: yearEdgeCase ? syear - 1 : syear,
            workOrder: data.workOrder,
            bonusPercentage: 0,
          };
          const filter = JSON.stringify(filterdata);
          console.log(filter);

          const wageresponse =
            await wagesAction.FETCH.fetchWagesForFinancialYear(filter);
          if (wageresponse.success) {
            toast.success("Succesfully retrived");
            const wagedata = JSON.parse(wageresponse.data);
            //changed as demand
            // const wageDataArray = wagedata.filter((employee) => {
            //   return employee.employee.designation_details[0].designation ===
            //     designationState;
            // });
            setWagesData(wagedata); //changed

            console.log("wow kya wage hai", wagedata);
          } else {
            toast.error("Internal Server Error");
          }
          setShowTable(true);

          setQuery({
            startDate: data.FromDate,
            endDate: data.ToDate,
            workOrder: data.workOrder,
            // Designation: data.Designation,
            DA: data.DA ? data.DA : false,
          });
        } else {
          toast.error(
            "The date range must be between April 1st and March 31st of the financial year"
          );
        }
      } else {
        toast.error("Choose Date Correctly");
      }
    } catch (err) {
      toast.error("Internal Server Error");
    }
  };

  return (
    <div>
      <h1 className="font-bold text-blue-500 border-b-2 border-blue-500 text-center py-2 mb-4">
        Arrear
      </h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="overflow-hidden mr-2 border-[1px] border-black rounded-md"
        >
          <h2 className=" bg-blue-100 text-center py-1 text-base   relative   ">
            Arrear Generator
          </h2>

          <div className="p-4 flex flex-col justify-center items-center md:justify-start md:flex-row gap-6">
            <FormField
              control={form.control}
              name="FromDate"
              render={({ field }) => (
                <FormItem className=" flex-col flex gap-1">
                  <FormLabel>From Date</FormLabel>

                  <input
                    type="Date"
                    value={field.value}
                    onChange={field.onChange}
                    min="2018-04-01"
                    className="p-1 px-2 rounded-sm text-black/95 border  border-gray-400"
                  />

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ToDate"
              render={({ field }) => (
                <FormItem className=" flex-col flex gap-1">
                  <FormLabel>To Date</FormLabel>

                  <input
                    type="Date"
                    value={field.value}
                    onChange={field.onChange}
                    min="2018-01-01"
                    className=" p-1 px-2 rounded-sm text-black/95 border border-gray-400"
                  />

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="workOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Order</FormLabel>
                  <Select
                    onValueChange={(e) => {
                      field.onChange(e);
                      setWorkOrderNumber(e);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        {field.value ? (
                          <SelectValue placeholder="" />
                        ) : (
                          "Select Work Order No."
                        )}
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-w-80 max-h-72">
                      {/* <SelectItem value="Default" key="Default">
                        Default
                      </SelectItem> */}

                      {allWorkOrderNumbers?.map((option, index) => (
                        <SelectItem value={option._id.toString()} key={option}>
                          {option.workOrderNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* <FormField
            control={form.control}
            name="Designation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Designation</FormLabel>
                <Select
                  onValueChange={(e) => {
                    field.onChange(e);
                    setDesignationState(e);
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      {field.value ? (
                        <SelectValue placeholder="" />
                      ) : (
                        "Select Designation"
                      )}
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-w-80 max-h-72">
                    {designationData?.map((option, index) => (
                      <SelectItem value={option} key={index}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          /> */}
          <FormField
            control={form.control}
            name="DA"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 py-2">
                <input
                  type="radio"
                  checked={field.value}
                  onChange={() => {
                    field.onChange(true);
                    setDaAllow((prev) => !prev);
                  }}
                />
                <FormLabel>DA</FormLabel>
              </FormItem>
            )}
          />
          <div className="py-4 ">
            <Button
              type="submit"
              className="flex items-center gap-1 border-2 border-black px-4 mb-2 rounded bg-green-500 text-white"
              value="SL"
              // onClick={handleSubmit(onSubmit)}
            >
              {form.formState.isSubmitting && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              <>Show List</>
            </Button>
          </div>
          <p className="text-red-400 text-center py-1 text-base">
            The date range must be between April 1st and March 31st of the
            financial year
          </p>
        </form>
      </Form>
      {showTable && (
        <div className="mt-8">
          <div className=" flex flex-col md:flex-row gap-2 w-fit">
            <Button
              type="submit"
              value="AR"
              size="sm"
              className=""
              onClick={() => setAAction("AR")}
            >
              <>Arrear Register</>
            </Button>
            <Button
              size="sm"
              value="AA"
              className=""
              onClick={() => setAAction("AA")}
            >
              Arrear Attendance
            </Button>
            <Button
              size="sm"
              value="ABS"
              className=""
              onClick={() => setAAction("ABS")}
            >
              Arrear BankStatement
            </Button>
            <Button
              size="sm"
              value="APS"
              className=""
              onClick={() => setAAction("APS")}
            >
              Arrear Pay Slip
            </Button>
          </div>
          { wagesData.length === 0 ? (
      <div className="mt-10 flex items-center justify-center"><span className="text-slate-800/55 text-3xl">Employee Data not available</span></div>
    ):(
          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>Employee Name</TableHead>
                <TableHead>Emp. Code</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Current Wage</TableHead>
                <TableHead>Last Wage</TableHead>
                <TableHead>Difference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wagesData.map((employee, index) => {
                const LastWage =
                  employee.employee?.designation_details[0]?.OldBasic;
                // const currentWage =
                //   employee.employee?.designation_details[0]?.basic;
                // const updatedWage = getUpdatedWage(
                //   employee.employee?._id,
                //   currentWage
                // );
                // const wageDifference = (updatedWage - currentWage).toFixed(2);
                const UpdatedWage =
                  employee.employee?.designation_details[0]?.basic;
                const wageDifference = (UpdatedWage - LastWage).toFixed(2);

                return (
                  <TableRow key={index}>
                    <TableCell>{employee.employee?.name}</TableCell>
                    <TableCell>{employee.employee?.code}</TableCell>
                    <TableCell>
                      {employee.employee?.designation_details[0]?.designation}
                    </TableCell>
                    <TableCell>{UpdatedWage}</TableCell>
                    <TableCell>
                      {/* <Input
                        type="number"
                        value={getUpdatedWage(
                          employee.employee._id,
                          employee.employee?.designation_details[0]?.basic
                        )}
                        onChange={(e) =>
                          handleWageChange(
                            employee.employee?._id,
                            parseFloat(e.target.value) || 'new wage'
                          )
                        }
                        className="w-20 p-1 rounded-sm text-black/95 border border-black"
                        placeholder="New Wage"
                      /> */}
                      {LastWage}
                    </TableCell>
                    <TableCell>{wageDifference}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
    )}
        </div>
      )}
    </div>
  );
};
export default Arrear;
