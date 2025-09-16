// src/utils/utils.ts

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number with the correct ordinal suffix (e.g., 1st, 2nd, 3rd, 4th).
 * @param n The number to format.
 * @returns A string with the number and its ordinal suffix.
 */
export function formatNumberWithOrdinal(n: number): string {
  // Return non-numbers as is, to be safe.
  if (n == null || typeof n !== "number" || isNaN(n)) {
    return String(n);
  }

  const lastDigit = n % 10;
  const lastTwoDigits = n % 100;

  // Handle special cases for 11th, 12th, 13th
  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return `${n}th`;
  }

  switch (lastDigit) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}
