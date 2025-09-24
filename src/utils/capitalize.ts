/**
 * Converts a string to title case, where the first letter of each word is capitalized.
 * It handles various formats, including all-lowercase, all-uppercase, or mixed-case strings.
 *
 * @param {string} str The input string to convert.
 * @returns {string} The formatted, title-cased string.
 *
 * @example
 * toTitleCase("hello world");
 *
 * @example
 * toTitleCase("aNOTHER eXAMPLE hERE");
 */
export const toTitleCase = (str: string): string => {
  // Return an empty string if the input is null, undefined, or empty
  if (!str) {
    return "";
  }

  return str
    .toLowerCase() // Step 1: Normalize the entire string to lowercase
    .split(" ") // Step 2: Split the string into an array of words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Step 3: Capitalize the first letter of each word
    .join(" "); // Step 4: Join the words back into a single string
};
