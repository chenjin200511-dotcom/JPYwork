// Purpose: Verifies CSV import guardrails reject mismatched pasted data safely.
import assert from "node:assert/strict";
import test from "node:test";
import { ApiError } from "./errors";
import { parseCsv } from "./csv";

const orderImportHeaders = {
  failOnRowError: true,
  optionalHeaders: ["totalAmount", "status"],
  requiredHeaders: ["externalOrderId", "customerName"],
};

test("parses valid CSV rows when headers match the import area", () => {
  const result = parseCsv(
    "externalOrderId,customerName,totalAmount\nSP-1,Ana,19.90",
    (row) => ({
      customerName: row.customerName,
      externalOrderId: row.externalOrderId,
      totalAmount: Number(row.totalAmount),
    }),
    orderImportHeaders,
  );

  assert.equal(result.succeeded, 1);
  assert.deepEqual(result.rows[0], {
    customerName: "Ana",
    externalOrderId: "SP-1",
    totalAmount: 19.9,
  });
});

test("rejects inventory headers pasted into the order import area", () => {
  assert.throws(
    () =>
      parseCsv(
        "sku,productName,available\nJPY-BOX-1,Desk box,5",
        (row) => row,
        orderImportHeaders,
      ),
    (error) =>
      error instanceof ApiError &&
      error.code === "CSV_FORMAT_MISMATCH" &&
      error.message === "格式不匹配，请重新复制",
  );
});

test("rejects malformed row values with a user-safe CSV error", () => {
  assert.throws(
    () =>
      parseCsv(
        "externalOrderId,customerName,totalAmount\nSP-1,Ana,not-a-number",
        (row) => {
          const totalAmount = Number(row.totalAmount);
          if (Number.isNaN(totalAmount)) {
            throw new Error("raw parser detail should not leak");
          }

          return { totalAmount };
        },
        orderImportHeaders,
      ),
    (error) =>
      error instanceof ApiError &&
      error.code === "CSV_FORMAT_MISMATCH" &&
      error.message === "格式不匹配，请重新复制",
  );
});
