const express = require("express");

const {
  addInvoice,
  getInvoices,
  getInvoice,
  editInvoice,
  removeInvoice,
} = require("../controllers/invoiceControllers");

const router = express.Router();

router.post("/", addInvoice);

router.get("/", getInvoices);

router.get("/:id", getInvoice);

router.put("/:id", editInvoice);

router.delete("/:id", removeInvoice);

module.exports = router;