"use client";

import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import EmployeeDataAction from "@/lib/actions/HR/EmployeeData/employeeDataAction";
import ComplianceRegisterAction from "@/lib/actions/HR/compliance-and-register/complianceRegisterAction";

// Define schemas for each form
const employeeSchema = z.object({
  employeeNumber: z.string().min(1, "Required"),
  name: z.string().optional(),
  advanceAmount: z.string().min(1, "Required"),
  advanceDate: z.string().min(1, "Required"),
  advancePurpose: z.string().min(1, "Required"),
  installments: z.string().min(1, "Required"),
  remarks: z.string().optional(),
});

const dateSchema = z.object({
  fromDate: z.string().min(1, "Required"),
  toDate: z.string().min(1, "Required"),
});

type EmployeeFormFields = z.infer<typeof employeeSchema>;
type DateFormFields = z.infer<typeof dateSchema>;

const AdvanceRegister = () => {

  const [employee, setEmployee] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      const response = await EmployeeDataAction.FETCH.fetchEmployeesWithWorkorderHr();
      const parsedData = JSON.parse(response.data);
      if (response.success) {
        toast.success(response.message);
        console.log("Here is the employee data: ", parsedData);
        setEmployee(parsedData);
      } else {
        toast.error(response.message);
      }
    };
    fetchEmployee();
  }, [])


  const employeeForm = useForm<EmployeeFormFields>({
    resolver: zodResolver(employeeSchema),
  });

  const dateForm = useForm<DateFormFields>({
    resolver: zodResolver(dateSchema),
  });

  const handleGenerateRegister: SubmitHandler<DateFormFields> = (data) => {
    toast.success("Advance register generated successfully!");
    console.log("Generating register from:", data.fromDate, "to:", data.toDate);
    dateForm.reset();
    window.open(
      `/hr/advance-and-damage/advance-register?fromData=${data.fromDate}&toData=${data.toDate}`
    );
  };

  const onSubmitEmployee: SubmitHandler<EmployeeFormFields> = async (data) => {
    if (!selectedEmployeeId) {
      toast.error("Please select an employee.");
      return;
    }
  
    try {
      // Structure the data payload

      
      const advanceEntry = {
        amountOfAdvanceGiven: parseFloat(data.advanceAmount),
        dateOfAdvanceGiven: data.advanceDate,
        purposeOfAdvanceGiven: data.advancePurpose,
        numberOfInstallments: parseInt(data.installments),
        installmentsLeft: parseInt(data.installments),
        remarks: data.remarks || "",
      };

      const payload = JSON.stringify({
        employeeId: selectedEmployeeId,
        advanceEntry,
      });
  
      // Call the server function
      const response = await ComplianceRegisterAction.CREATE.addEmployeeToAdvanceRegister(payload);
  
      if (response.success) {
        toast.success(response.message);
        employeeForm.reset({
          employeeNumber: "",
          name: "",
          advanceAmount: "",
          advanceDate: "",
          advancePurpose: "",
          installments: "",
          remarks: "",
        });
        setSelectedEmployeeId(null); 
      } else {
        toast.error(response.message || "Failed to update advance register.");
      }
    } catch (error) {
      toast.error("An error occurred while adding the employee.");
      console.error("Error:", error);
    }
  };

  // Get selected employee details
  const selectedEmployee = employee?.find((emp: any) => emp._id === selectedEmployeeId);

  return (
    <div className="flex">
      {/* Employee Form */}
      <div className="ml-[80px] w-full max-w-3xl">
        <Form {...employeeForm}>
          <form
            onSubmit={employeeForm.handleSubmit(onSubmitEmployee)}
            className="space-y-4 p-6 border border-gray-300 rounded-md bg-white shadow-sm"
          >
            <h2 className="text-center text-xl font-semibold text-gray-700 mb-4">
              Add Employee to Advance Register
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={employeeForm.control}
                name="employeeNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee Number</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedEmployeeId(value);
                        }}
                        value={selectedEmployeeId || ""}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Employee Code" />
                        </SelectTrigger>
                        <SelectContent>
                          {employee?.map((emp: any) => (
                            <SelectItem key={emp._id} value={emp._id}>
                              {emp.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Other Fields */}
              {[
                { label: "Employee Name", name: "name" },
                { label: "Amount of Advance Given", name: "advanceAmount", type: "number" },
                { label: "Date of Advance Given", name: "advanceDate", type: "date" },
                { label: "Purpose of Advance Given", name: "advancePurpose" },
                { label: "Number of Installments", name: "installments", type: "number" },
                { label: "Remarks", name: "remarks" },
              ].map((field) => (
                <FormField
                  key={field.name}
                  control={employeeForm.control}
                  //@ts-ignore
                  name={field.name}
                  render={({ field: inputField }) => (
                    <FormItem>
                      <FormLabel>{field.label}</FormLabel>
                      <FormControl>
                        <input
                          {...inputField}
                          type={field.type || "text"}
                          className="border border-gray-300 px-3 py-2 rounded-md w-full"
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          value={selectedEmployee ? selectedEmployee[field.name] : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <div className="flex justify-center pt-4">
              <Button type="submit" className="flex items-center gap-1 px-6 py-2 bg-green-500 text-white rounded-md">
                {employeeForm.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Add to Register
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* Date Form */}
      <div className="ml-[30px] w-full max-w-3xl">
        <Form {...dateForm}>
          <form
            onSubmit={dateForm.handleSubmit(handleGenerateRegister)}
            className="space-y-4 p-6 border border-gray-300 rounded-md bg-white shadow-sm"
          >
            <h2 className="text-center text-xl font-semibold text-gray-700 mb-4">
              Generate Advance Register
            </h2>
            <div className="flex gap-10">
              <FormField
                control={dateForm.control}
                name="fromDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From Date</FormLabel>
                    <FormControl>
                      <input
                        type="date"
                        {...field}
                        min="2018-01-01"
                        className="bg-slate-100 p-1 w-full rounded-sm text-black/95 border border-black/35"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={dateForm.control}
                name="toDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To Date</FormLabel>
                    <FormControl>
                      <input
                        type="date"
                        {...field}
                        min="2018-01-01"
                        className="bg-slate-100 p-1 w-full rounded-sm text-black/95 border border-black/35"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="py-4">
              <Button type="submit" className="flex items-center gap-1 border-2 border-black px-4 mb-2 rounded bg-green-500 text-white">
                {dateForm.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Show Advance Register
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default AdvanceRegister;
