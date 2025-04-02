export const getYearForInvoiceNaming = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-11 (Jan-Dec)

  // Financial year starts from April (month index 3)
  const financialYearStart = currentMonth >= 3 ? currentYear : currentYear - 1;
  const financialYearEnd = financialYearStart + 1;

  // Get last two digits and format as "25-26"
  return `${financialYearStart.toString().slice(-2)}-${financialYearEnd
    .toString()
    .slice(-2)}`;
};
