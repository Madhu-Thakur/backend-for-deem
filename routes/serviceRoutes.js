const express = require("express");

const {
  addService,
  getServices,
  getCustomerServices,
  getService,
  editService,
  removeService,
} = require("../controllers/serviceControllers");

const router = express.Router();

// Create Service
router.post("/", addService);

// Get All Services
router.get("/", getServices);

// Get Services Of A Customer
router.get("/customer/:customerId", getCustomerServices);

// Get Service By ID
router.get("/:id", getService);

// Update Service
router.put("/:id", editService);

// Delete Service
router.delete("/:id", removeService);

module.exports = router;