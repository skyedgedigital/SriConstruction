// "use server";

// import connectToDB from "@/lib/database";
// import mongoose, { Schema } from "mongoose";
// // import ToolGroup from "@/lib/models/Safety/toolgroup.model";
// // import ToolSubGroup from "@/lib/models/Safety/toolsubgroup.model";
// // import ToolIssue from "@/lib/models/Safety/toolissue.model";
// // import SafetyTool from "@/lib/models/Safety/tool.model";




// const updateTool = async (toolId, data) => {
//     try {
//         const parsedData = JSON.parse(data);
//         const tool = await SafetyTool.findById(toolId);

//         if (!tool) {
//             return { success: false, message: "Tool not found" };
//         }

//         const originalStatus = tool.status;

//         // Update only the fields provided in parsedData
//         for (let key in parsedData) {
//             if (parsedData.hasOwnProperty(key)) {
//                 tool[key] = parsedData[key];
//             }
//         }

//         await tool.save();

//         const toolSubGroup = await ToolSubGroup.findById(tool.toolSubGroup);
//         if (toolSubGroup) {
//             if (originalStatus === 'issued' && tool.status === 'returned') {
//                 toolSubGroup.availableQuantity += 1;
//             } else if (originalStatus === 'returned' && tool.status === 'issued') {
//                 toolSubGroup.availableQuantity -= 1;
//             }
//             await toolSubGroup.save();
//         }

//         return { success: true, message: "Tool updated successfully" };
//     } catch (error) {
//         return { success: false, message: error.message };
//     }
// };

// const updateToolIssue = async (issueId, data) => {
//     try {
//         const parsedData = JSON.parse(data);
//         const toolIssue = await ToolIssue.findById(issueId);

//         if (!toolIssue) {
//             return { success: false, message: "Tool issue not found" };
//         }

//         const originalStatus = toolIssue.issueStatus;
//         const originalQuantity = toolIssue.quantity;

//         // Update only the fields provided in parsedData
//         for (let key in parsedData) {
//             if (parsedData.hasOwnProperty(key)) {
//                 toolIssue[key] = parsedData[key];
//             }
//         }

//         await toolIssue.save();

//         const toolSubGroup = await ToolSubGroup.findById(toolIssue.toolSubGroup);
//         if (toolSubGroup) {
//             if (originalStatus === 'issued' && toolIssue.issueStatus === 'returned') {
//                 toolSubGroup.availableQuantity += originalQuantity;
//             } else if (originalStatus === 'returned' && toolIssue.issueStatus === 'issued') {
//                 toolSubGroup.availableQuantity -= originalQuantity;
//             } else if (toolIssue.issueStatus === 'issued' && toolIssue.quantity !== originalQuantity) {
//                 toolSubGroup.availableQuantity += originalQuantity - toolIssue.quantity;
//             }
//             await toolSubGroup.save();
//         }

//         return { success: true, message: "Tool issue updated successfully" };
//     } catch (error) {
//         return { success: false, message: error.message };
//     }
// };


// export {updateTool,updateToolIssue}