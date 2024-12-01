const calcSundays = (month: number, year: number) => {
    let date = new Date(year, month - 1, 1);  // Start at the 1st of the month
    const daysInMonth = new Date(year, month, 0).getDate();  // Total days in the month
    let sundaysCount = 0;
    let sundayDates: number[] = [];  // Array to store the dates of Sundays

    for (let day = 1; day <= daysInMonth; day++) {
        date.setDate(day);
        if (date.getDay() === 0) {  // Check if it's Sunday
            sundaysCount++;
            sundayDates.push(day);  // Add the day to the sundayDates array
        }
    }

    return {
        sundays: sundaysCount,
        totalDays: daysInMonth,
        sundayDates: sundayDates  // Include the array of Sunday dates
    };
}

export default calcSundays;
