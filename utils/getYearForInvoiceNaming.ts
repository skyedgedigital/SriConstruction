export const getYearForInvoiceNaming = () => {
  const yearNow = Number(new Date().getFullYear().toString().slice(1));
  return `${yearNow}-${yearNow + 1}`;
};
