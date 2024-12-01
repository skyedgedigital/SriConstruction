'use server'
import handleDBConnection from "../database";
import Enterprise from "../models/enterprise.model";
async function saveEnterpriseInfo(info:string) {
   const dbConnection = await handleDBConnection();
   if (!dbConnection.success) return dbConnection;
    try {
      // Check if an enterprise document already exists
      console.log("boigigig")
      const infor=await JSON.parse(info)
      console.log(infor)
      let enterprise = await Enterprise.findOne();
  console.log("wowowowmd",infor)
      if (!enterprise) {
        // If no document exists, create a new one
        enterprise = new Enterprise(infor);
      } else {
        // If a document exists, update it with the new info
        Object.assign(enterprise, infor);
      }
  
      // Save the enterprise document (either new or updated)
      await enterprise.save();
  
      return { success: true, message: 'Enterprise information saved successfully' };
    } catch (error) {
        console.log(error)

      return { success: false, message: 'Failed to save enterprise information', error };
    }
  }


  async function fetchEnterpriseInfo() {
     const dbConnection = await handleDBConnection();
     if (!dbConnection.success) return dbConnection;
    try {
      // Fetch the enterprise details (assuming there's only one document)
      const enterprise = await Enterprise.findOne();
      
      if (!enterprise) {
        return { success: false, message: 'Enterprise details not found' };
      }
  
      return { success: true, data: JSON.stringify(enterprise) };
    } catch (error) {
      return { success: false, message: 'Failed to fetch enterprise details', error };
    }
  }

  export {fetchEnterpriseInfo,saveEnterpriseInfo}