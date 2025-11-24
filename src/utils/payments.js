import express from "express";
const router = express.Router();

let payments = [
  { id: 1, name: "Client A", amount: 120, currency: "USD", status: "Paid", date: "2025-11-07" },
  { id: 2, name: "Client B", amount: 5000, currency: "INR", status: "Pending", date: "2025-11-05" },
];

// 🧾 Get all payments
router.get("/", (req, res) => {
  res.json(payments);
});

// ➕ Add payment
router.post("/", (req, res) => {
  const newPayment = { id: Date.now(), ...req.body };
  payments.push(newPayment);
  res.json(newPayment);
});

// ✏️ Update payment
router.put("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  payments = payments.map((p) => (p.id === id ? { ...p, ...req.body } : p));
  res.json({ message: "Updated", payments });
});

// ❌ Delete payment
router.delete("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  payments = payments.filter((p) => p.id !== id);
  res.json({ message: "Deleted", payments });
});

export default router;