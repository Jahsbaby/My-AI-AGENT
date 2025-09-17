import { expect, test } from "bun:test";
import { formatDate } from "../utils/date";

// Test: formatDate should return a string in YYYY-MM-DD format
test("formatDate matches today's real date", () => {
  const result = formatDate();

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  const expected = `${year}-${month}-${day}`;
  expect(result).toBe(expected);
});
