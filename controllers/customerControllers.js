const {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} = require("../models/customerModel");

// Create Customer
const addCustomer = async (req, res) => {
  try {
    const { customer_name, company_name, phone, email, status } = req.body;

    // Basic validation
    if (!customer_name || !phone || !email) {
      return res.status(400).json({
        success: false,
        message: "Customer name, phone and email are required",
      });
    }

    const customerId = await createCustomer({
      customer_name,
      company_name,
      phone,
      email,
      status,
    });

    return res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: {
        id: customerId,
      },
    });
  } catch (error) {
    console.error("Create Customer Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create customer",
      error: error.message,
    });
  }
};

// Get All Customers
const getCustomers = async (req, res) => {
  try {
    const customers = await getAllCustomers();

    return res.status(200).json({
      success: true,
      message: "Customers fetched successfully",
      data: customers,
    });
  } catch (error) {
    console.error("Get Customers Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
      error: error.message,
    });
  }
};

// Get Customer By ID
const getCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await getCustomerById(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Customer fetched successfully",
      data: customer,
    });
  } catch (error) {
    console.error("Get Customer Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer",
      error: error.message,
    });
  }
};

// Update Customer
const editCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { customer_name, company_name, phone, email, status } = req.body;

    if (!customer_name || !phone || !email) {
      return res.status(400).json({
        success: false,
        message: "Customer name, phone and email are required",
      });
    }

    const result = await updateCustomer(id, {
      customer_name,
      company_name,
      phone,
      email,
      status,
    });

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Customer updated successfully",
    });
  } catch (error) {
    console.error("Update Customer Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update customer",
      error: error.message,
    });
  }
};

// Delete Customer
const removeCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await deleteCustomer(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("Delete Customer Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete customer",
      error: error.message,
    });
  }
};

module.exports = {
  addCustomer,
  getCustomers,
  getCustomer,
  editCustomer,
  removeCustomer,
};