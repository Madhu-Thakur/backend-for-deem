const express = require("express");

const {
  addAddress,
  getAddresses,
  getCustomerAddresses,
  getAddress,
  editAddress,
  removeAddress,
} = require("../controllers/addressControllers");

const router = express.Router();

// Create Address
router.post("/", addAddress);

// Get All Addresses
router.get("/", getAddresses);

// Get All Addresses Of A Customer
router.get("/customer/:customerId", getCustomerAddresses);

// Get Address By ID
router.get("/:id", getAddress);

// Update Address
router.put("/:id", editAddress);

// Delete Address
router.delete("/:id", removeAddress);

module.exports = router;