
import { format, formatDistance, isToday, isYesterday, isThisWeek } from "date-fns";

/**
 * Format a date string into a more readable format
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export function formatDateRelative(dateString: string): string {
  try {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`;
    } else if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'h:mm a')}`;
    } else if (isThisWeek(date)) {
      return format(date, 'EEEE');
    } else {
      return format(date, 'MMM d, yyyy');
    }
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
}

/**
 * Format a date string into a relative time (e.g. "2 days ago")
 * @param dateString ISO date string
 * @returns Relative time string
 */
export function formatTimeAgo(dateString: string): string {
  try {
    const date = new Date(dateString);
    return formatDistance(date, new Date(), { addSuffix: true });
  } catch (error) {
    console.error("Error formatting relative time:", error);
    return dateString;
  }
}

/**
 * Format a date string into a standard format
 * @param dateString ISO date string
 * @param formatString Date format string
 * @returns Formatted date string
 */
export function formatDateStandard(dateString: string, formatString: string = 'MMM d, yyyy'): string {
  try {
    const date = new Date(dateString);
    return format(date, formatString);
  } catch (error) {
    console.error("Error formatting standard date:", error);
    return dateString;
  }
}
