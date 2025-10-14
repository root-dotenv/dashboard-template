// Simple toast utility for demonstration
export function toastSuccess({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  // Replace with your actual toast implementation
  console.log(`SUCCESS: ${title} - ${description}`);
}

export function toastError({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  // Replace with your actual toast implementation
  console.error(`ERROR: ${title} - ${description}`);
}
