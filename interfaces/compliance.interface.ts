interface ICompliance extends Document{
    vehicleNumber:string;
    month:string;
    DocId:string;
    createdAt:Date;
    updatedAt:Date;
    year:string;
    compliance:string;
    complianceDesc:string;
    Date:Date;
    amount:number
}

export default ICompliance