// Format date to display in the UI
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

// Format date to show only the time
export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// Get first day of month for a given date
export const getFirstDayOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

// Get last day of month for a given date
export const getLastDayOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

// Get first day of year for a given date
export const getFirstDayOfYear = (date: Date): Date => {
  return new Date(date.getFullYear(), 0, 1);
};

// Get last day of year for a given date
export const getLastDayOfYear = (date: Date): Date => {
  return new Date(date.getFullYear(), 11, 31);
};

// Get expenses in a date range
export const isDateInRange = (
  dateToCheck: string,
  startDate: string,
  endDate: string
): boolean => {
  const date = new Date(dateToCheck);
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return date >= start && date <= end;
};

// Get month name from month index
export const getMonthName = (month: number): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month];
};

// Get dates for the current week
export const getCurrentWeekDates = (): { startDate: string, endDate: string } => {
  const today = new Date();
  const day = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Calculate days from Sunday
  const daysFromSunday = day;
  
  // Calculate start date (Sunday)
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - daysFromSunday);
  startDate.setHours(0, 0, 0, 0);
  
  // Calculate end date (Saturday)
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);
  
  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
};

// Get dates for current month
export const getCurrentMonthDates = (): { startDate: string, endDate: string } => {
  const today = new Date();
  const startDate = getFirstDayOfMonth(today);
  const endDate = getLastDayOfMonth(today);
  
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);
  
  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
};

// Get dates for current year
export const getCurrentYearDates = (): { startDate: string, endDate: string } => {
  const today = new Date();
  const startDate = getFirstDayOfYear(today);
  const endDate = getLastDayOfYear(today);
  
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);
  
  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
};