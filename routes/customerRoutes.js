const express = require("express");

const {
  addCustomer,
  getCustomers,
  getCustomer,
  editCustomer,
  removeCustomer,
} = require("../controllers/customerControllers");

const router = express.Router();

// Create Customer
router.post("/", addCustomer);

// Get All Customers
router.get("/", getCustomers);

// Get Customer By ID
router.get("/:id", getCustomer);

// Update Customer
router.put("/:id", editCustomer);

// Delete Customer
router.delete("/:id", removeCustomer);

module.exports = router;