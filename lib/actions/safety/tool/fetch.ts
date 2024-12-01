// "use server";

// import connectToDB from "@/lib/database";
// import mongoose, { Schema } from "mongoose";
// // import ToolGroup from "@/lib/models/Safety/toolgroup.model";
// // import ToolSubGroup from "@/lib/models/Safety/toolsubgroup.model";
// // import ToolIssue from "@/lib/models/Safety/toolissue.model";
// // import SafetyTool from "@/lib/models/Safety/tool.model";


// const fetchAllTools = async () => {
//     try {
//         const tools = await SafetyTool.find().populate('toolSubGroup', 'name').populate('issuedTo', 'name');
//         return { success: true, data: JSON.stringify(tools) };
//     } catch (error) {
//         return { success: false, message: error.message, error: JSON.stringify(error) };
//     }
// };


// const fetchAllToolIssues = async () => {
//     try {
//         const toolIssues = await ToolIssue.find()
//             .populate('toolSubGroup', 'name')
//             .populate('tools', 'toolNumber')
//             .populate('employee', 'name');
//         return { success: true, data: JSON.stringify(toolIssues) };
//     } catch (error) {
//         return { success: false, message: error.message, error: JSON.stringify(error) };
//     }
// };


// const fetchToolIssuesByIssueDate = async (issueDate) => {
//     try {
//         const toolIssues = await ToolIssue.find({
//             issueDate: new Date(issueDate)
//         })
//         .populate('toolSubGroup', 'name')
//         .populate('tools', 'toolNumber')
//         .populate('employee', 'name');
//         return { success: true, data: JSON.stringify(toolIssues) };
//     } catch (error) {
//         return { success: false, message: error.message, error: JSON.stringify(error) };
//     }
// };


// export {fetchAllToolIssues,fetchToolIssuesByIssueDate,fetchAllTools}