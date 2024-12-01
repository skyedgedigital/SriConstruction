import mongoose from "mongoose";


const dummyChalan: any = {
  workOrder: new mongoose.Types.ObjectId('65fc36254a7c01959250eda4'), 
  department: new mongoose.Types.ObjectId('660a9e3155a222870570bf3b'),
  engineer: new mongoose.Types.ObjectId('65fd4e234a7c01959250edd6'), 
  date: new Date(), // Current date
  chalanNumber: "testing2",
  location: "Site A",
  workDescription: "Routine maintenance of equipment",
  file: "/path/to/document.pdf",
  status: "pending", // One of ['approved', 'pending', 'unsigned', 'generated','signed']
  items:[
    {
      item:'66193558c47817725a26d5c2',
      vehicleNumber:'JH01EU1690',
      unit:'hours',
      hours:1,
      startTime: "09:00",
      endTime: "14:00"
    },
    {
      item:'66193695c47817725a26d680',
      vehicleNumber:'JH01EU1699',
      unit:'hours',
      hours:2,
      startTime: "09:00",
      endTime: "14:00"
    }
  ],
  commentByDriver:"Driver Comment",
  commentByFleetManager:'Fleet Manager'
};

export default dummyChalan;
