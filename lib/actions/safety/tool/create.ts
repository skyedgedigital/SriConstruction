// "use server";

// import connectToDB from "@/lib/database";
// import mongoose, { Schema } from "mongoose";
// import ToolGroup from "@/lib/models/Safety/toolgroup.model";
// import ToolSubGroup from "@/lib/models/Safety/toolsubgroup.model";
// import ToolIssue from "@/lib/models/Safety/toolissue.model";
// import SafetyTool from "@/lib/models/Safety/tool.model";

// const addToolGroup = async (data) => {
//     try {
//         await connectToDB()
//         const parsedData = JSON.parse(data);
//         const newToolGroup = new ToolGroup(parsedData);
//         await newToolGroup.save();
//         return { success: true, message: "Tool Group added successfully",data:JSON.stringify(newToolGroup) };
//     } catch (error) {
//         return { success: false, message: error.message,error:JSON.stringify(error) };
//     }
// };


// const addToolSubGroup = async (data) => {
//     try {
//         await connectToDB()
//         const parsedData = JSON.parse(data);
//         const newToolSubGroup = new ToolSubGroup(parsedData);
//       //  newToolSubGroup.availableQuantity = parsedData.quantity; // Initialize available quantity
//         await newToolSubGroup.save();
//         return { success: true, message: "Tool SubGroup added successfully",data:JSON.stringify(newToolSubGroup) };
//     } catch (error) {
//         return { success: false, message: error.message,error:JSON.stringify(error) };
//     }
// };


// const addTool = async (data) => {
//     try {
//         await connectToDB();
//         const parsedData = JSON.parse(data);
//         const newTool = new SafetyTool(parsedData);
//         await newTool.save();

//         const toolSubGroup = await ToolSubGroup.findById(parsedData.toolSubGroup);
//         if (toolSubGroup) {
//             toolSubGroup.availableQuantity += 1;
//             await toolSubGroup.save();
//         }

//         return { success: true, message: "Tool added successfully", data:JSON.stringify(newTool) };
//     } catch (error) {
//         return { success: false, message: error.message , error:JSON.stringify(error)};
//     }
// };


// const addToolIssue = async (data) => {
//     try { await connectToDB();
//         const parsedData = JSON.parse(data);
//         const newToolIssue = new ToolIssue(parsedData);
//         await newToolIssue.save();

//         const toolSubGroup = await ToolSubGroup.findById(parsedData.toolSubGroup);
//         if (toolSubGroup) {
//             toolSubGroup.availableQuantity -= parsedData.quantity;
//             await toolSubGroup.save();
//         }

//         return { success: true, message: "Tool issue added successfully" };
//     } catch (error) {
//         return { success: false, message: error.message };
//     }
// };

// export {addTool,addToolGroup,addToolIssue,addToolSubGroup}