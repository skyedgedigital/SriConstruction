"use client";
import React, { useEffect, useState } from "react";
import AddVehicle from "@/components/fleet-manager/AddVehicle";
import EditVehicle from "@/components/fleet-manager/EditVehicle";
import { vehicleColumns } from "@/components/fleet-manager/VehicleColumns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/hr/VehicleSettingsDataTable";
import vehicleAction from "@/lib/actions/vehicle/vehicleAction";

// eslint-disable-next-line @next/next/no-async-client-component
const Chalans: React.FC<{}> = () => {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    const fetchVehicles = async () => {
      const res = await vehicleAction.FETCH.fetchAllVehicles();
      const vehicles = JSON.parse(res.data);
      setVehicles(vehicles);
    };
    fetchVehicles();
  }, []);

  return (
    <Tabs defaultValue="addVehicle">
      <h1 className="font-bold text-blue-500 border-b-2 border-blue-500 text-center py-2 mb-4">
        Vehicle Settings
      </h1>
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 justify-content-center">
        <TabsTrigger value="addVehicle">Add Vehicle</TabsTrigger>
        <TabsTrigger value="editVehicle">Edit Vehicle</TabsTrigger>
        <TabsTrigger value="viewVehicles">View Vehicles</TabsTrigger>
      </TabsList>
      <TabsContent value="addVehicle">
        <AddVehicle />
      </TabsContent>
      <TabsContent value="editVehicle">
        <EditVehicle />
      </TabsContent>
      <TabsContent value="viewVehicles">
        <DataTable
          columns={vehicleColumns}
          data={vehicles}
          filterValue="vehicleNumber"
        />
      </TabsContent>
    </Tabs>
  );
};

export default Chalans;
