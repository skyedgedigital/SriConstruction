function sortByEmployeeName(data) {
  return data.sort((a, b) => {
    const nameA =
      a.employee && typeof a.employee.name === 'string'
        ? a.employee.name.toLowerCase()
        : '';
    const nameB =
      b.employee && typeof b.employee.name === 'string'
        ? b.employee.name.toLowerCase()
        : '';

    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0; // names are equal or both missing
  });
}

export default sortByEmployeeName;
