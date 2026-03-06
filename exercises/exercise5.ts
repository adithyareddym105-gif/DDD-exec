import { logError } from "./logger.js";

//============================================================================
// EXERCISE 5: The Identity Crisis - Order IDs
//
// ANTI-PATTERN: Using a plain `string` for an identifier. Nothing enforces
// format, non-emptiness, or uniqueness. Duplicate and empty IDs slip through.
//
// DDD FIX: Model identity as a dedicated Value Object with a controlled
// creation strategy. In DDD, the identity of an Entity is a first-class
// concept -- it deserves its own type.
//
// HINT - Branded type + factory:
//   type OrderId = string & { readonly __brand: unique symbol }
//
//   // Option A: Enforce a format (e.g., "ORD-" prefix + numeric)
//   function createOrderId(raw: string): OrderId {
//       if (!/^ORD-\d{5,}$/.test(raw))
//           throw new Error("OrderId must match ORD-XXXXX format")
//       return raw as OrderId
//   }
//
//   // Option B: Generate guaranteed-unique IDs (UUID-based)
//   function generateOrderId(): OrderId {
//       return `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` as OrderId
//   }
//
// For uniqueness across a collection, use a Repository pattern: the
// Repository is responsible for ensuring no two Entities share an ID.
// This separates identity validation (Value Object) from uniqueness
// enforcement (Repository).
// ============================================================================

export function exercise5_IdentityCrisis() {
  type OrderId = string & { readonly __brand: unique symbol };

  function createOrderId(raw: string): OrderId {
    if (!/^ORD-\d{5,}$/.test(raw))
      throw new Error("OrderId must match ORD-XXXXX format");
    return raw as OrderId;
  }

  type Order = {
    orderId: OrderId; // Just a string - could be anything!
    customerName: string;
    total: number;
  };

  // TODO: Replace `string` with an OrderId branded type.
  // Use a factory function that enforces a consistent format.
  // Consider who is responsible for uniqueness (hint: Repository pattern).

  // What makes a valid order ID? Nothing enforced!
  const invalidCases: Array<{ raw: string; customerName: string; total: number }> = [
    { raw: "",              customerName: "Alice",   total: 25 }, // Silent bug! Empty ID
    { raw: "12345",         customerName: "Bob",     total: 30 }, // Is this valid?
    { raw: "12345",         customerName: "Charlie", total: 15 }, // Silent bug! Duplicate ID
    { raw: "not-a-number",  customerName: "Diana",   total: 20 }, // Silent bug! Inconsistent format
  ];

  for (const { raw, customerName, total } of invalidCases) {
    try {
      const order: Order = {
        orderId: createOrderId(raw),
        customerName,
        total,
      };
      logError(5, "Order ID chaos - duplicates, empty, inconsistent formats", {
        order,
        issue: "Order IDs have no enforced format or uniqueness!",
      });
    } catch (e: unknown) {
      console.log(`OrderId "${raw}" correctly rejected:`, (e as Error).message);
    }
  }
}