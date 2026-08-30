const {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
} = require("../models/invoiceModel");

const db = require("../config/db");
 
const calculateGSTFromGrandTotal = (
  grandTotal,
  isSameState,
) => {
  const total = Number(grandTotal);

  if (!Number.isFinite(total) || total <= 0) {
    throw new Error(
      "Grand total must be a valid positive amount",
    );
  }
 
  const amount = total / 1.18;

  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (isSameState) {
    cgst = amount * 0.09;
    sgst = amount * 0.09;
  } else {
    igst = amount * 0.18;
  }

  return {
    amount: Number(amount.toFixed(2)),
    cgst: Number(cgst.toFixed(2)),
    sgst: Number(sgst.toFixed(2)),
    igst: Number(igst.toFixed(2)),
    grand_total: Number(total.toFixed(2)),
  };
};
 
const getGSTType = async (addressId) => {
  const [rows] = await db.execute(
    `
      SELECT
        id,
        state,
        country
      FROM address_table
      WHERE id = ?
    `,
    [addressId],
  );

  if (rows.length === 0) {
    throw new Error("Selected address not found");
  }

  const address = rows[0];

  // DEEM registered state
  const DEEM_STATE = "Gujarat";

  const customerCountry = String(
    address.country || "",
  ).trim();

  const customerState = String(
    address.state || "",
  ).trim();
 
  if (
    customerCountry.toLowerCase() !== "india"
  ) {
    return {
      gstApplicable: false,
      isSameState: false,
    };
  }

  const isSameState =
    customerState.toLowerCase() ===
    DEEM_STATE.toLowerCase();

  return {
    gstApplicable: true,
    isSameState,
  };
};
 
const validateItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error(
      "At least one invoice item is required",
    );
  }

  for (const item of items) {
    if (!item.item_name?.trim()) {
      throw new Error("Item name is required");
    }
 
  }
};
 
const addInvoice = async (req, res) => {
  try {
    const {
      customer_id,
      address_id,
      invoice_date,
      payment_mode,
      payment_status,
      grand_total,
      note,
      items,
    } = req.body;

    if (!customer_id) {
      return res.status(400).json({
        success: false,
        message: "Customer is required",
      });
    }

    if (!address_id) {
      return res.status(400).json({
        success: false,
        message: "Address is required",
      });
    }

    if (!invoice_date) {
      return res.status(400).json({
        success: false,
        message: "Invoice date is required",
      });
    }

    if (!payment_mode) {
      return res.status(400).json({
        success: false,
        message: "Payment mode is required",
      });
    }

    if (
      grand_total === undefined ||
      grand_total === null ||
      grand_total === "" ||
      Number(grand_total) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Grand total must be greater than 0",
      });
    }

    try {
      validateItems(items);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // Check selected address
    const gstInfo = await getGSTType(address_id);

    if (!gstInfo.gstApplicable) {
      return res.status(400).json({
        success: false,
        message:
          "GST calculation is not applicable for this address country",
      });
    }
 
    const gst = calculateGSTFromGrandTotal(
      grand_total,
      gstInfo.isSameState,
    );

    const calculatedItems = items.map(
      (item, index) => ({
        item_name: item.item_name.trim(),
        hsn: item.hsn || null,
        amount:
          index === 0
            ? gst.amount
            : 0,
      }),
    );

    const result = await createInvoice(
      {
        customer_id,
        address_id,
        invoice_date,
        payment_mode,
        payment_status:
          payment_status || "Pending",
 
        subtotal: gst.amount,

        cgst: gst.cgst,
        sgst: gst.sgst,
        igst: gst.igst,
        grand_total: gst.grand_total,

        note,
      },
      calculatedItems,
    );

    return res.status(201).json({
      success: true,
      message: "Invoice created successfully",

      data: {
        id: result.id,
        invoice_number: result.invoice_number,

        amount: gst.amount,

        cgst: gst.cgst,
        sgst: gst.sgst,
        igst: gst.igst,

        grand_total: gst.grand_total,
      },
    });
  } catch (error) {
    console.error(
      "Create Invoice Error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create invoice",
      error: error.message,
    });
  }
};
 
const getInvoices = async (req, res) => {
  try {
    const invoices = await getAllInvoices();

    return res.status(200).json({
      success: true,
      message:
        "Invoices fetched successfully",
      data: invoices,
    });
  } catch (error) {
    console.error(
      "Get Invoices Error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch invoices",
      error: error.message,
    });
  }
};
 
const getInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await getInvoiceById(id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Invoice fetched successfully",
      data: invoice,
    });
  } catch (error) {
    console.error(
      "Get Invoice Error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch invoice",
      error: error.message,
    });
  }
};
 
const editInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      customer_id,
      address_id,
      invoice_date,
      payment_mode,
      payment_status,
      grand_total,
      note,
      items,
    } = req.body;

    if (!customer_id) {
      return res.status(400).json({
        success: false,
        message: "Customer is required",
      });
    }

    if (!address_id) {
      return res.status(400).json({
        success: false,
        message: "Address is required",
      });
    }

    if (!invoice_date) {
      return res.status(400).json({
        success: false,
        message: "Invoice date is required",
      });
    }

    if (!payment_mode) {
      return res.status(400).json({
        success: false,
        message: "Payment mode is required",
      });
    }

    if (
      grand_total === undefined ||
      grand_total === null ||
      grand_total === "" ||
      Number(grand_total) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Grand total must be greater than 0",
      });
    }

    try {
      validateItems(items);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // Check address and determine GST
    const gstInfo = await getGSTType(address_id);

    if (!gstInfo.gstApplicable) {
      return res.status(400).json({
        success: false,
        message:
          "GST calculation is not applicable for this address country",
      });
    }

    // Recalculate GST from Grand Total
    const gst = calculateGSTFromGrandTotal(
      grand_total,
      gstInfo.isSameState,
    );

    const calculatedItems = items.map(
      (item, index) => ({
        item_name: item.item_name.trim(),
        hsn: item.hsn || null,
        amount:
          index === 0
            ? gst.amount
            : 0,
      }),
    );

    const updated = await updateInvoice(
      id,
      {
        customer_id,
        address_id,
        invoice_date,
        payment_mode,
        payment_status:
          payment_status || "Pending",

        subtotal: gst.amount,

        cgst: gst.cgst,
        sgst: gst.sgst,
        igst: gst.igst,
        grand_total: gst.grand_total,

        note,
      },
      calculatedItems,
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Invoice updated successfully",

      data: {
        id,
        amount: gst.amount,

        cgst: gst.cgst,
        sgst: gst.sgst,
        igst: gst.igst,

        grand_total: gst.grand_total,
      },
    });
  } catch (error) {
    console.error(
      "Update Invoice Error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update invoice",
      error: error.message,
    });
  }
};
 
const removeInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await deleteInvoice(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Invoice deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Invoice Error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete invoice",
      error: error.message,
    });
  }
};


module.exports = {
  addInvoice,
  getInvoices,
  getInvoice,
  editInvoice,
  removeInvoice,
};