// utils/date.ts
export function formatDate(): string {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // add leading 0
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
