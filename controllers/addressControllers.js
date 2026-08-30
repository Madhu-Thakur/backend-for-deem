const {
  createAddress,
  getAllAddresses,
  getAddressesByCustomerId,
  getAddressById,
  updateAddress,
  deleteAddress,
} = require("../models/addressModel");

// Create Address
const addAddress = async (req, res) => {
  try {
    const {
      customer_id,
      address_type,
      address,
      gst_number,
      city,
      state,
      pincode,
      country,
    } = req.body;

    if (
      !customer_id ||
      !address_type ||
      !address ||
      !city ||
      !state ||
      !pincode
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Customer ID, address type, address, city, state and pincode are required",
      });
    }

    const addressId = await createAddress({
      customer_id,
      address_type,
      address,
      gst_number,
      city,
      state,
      pincode,
      country,
    });

    return res.status(201).json({
      success: true,
      message: "Address created successfully",
      data: {
        id: addressId,
      },
    });
  } catch (error) {
    console.error("Create Address Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create address",
      error: error.message,
    });
  }
};

// Get All Addresses
const getAddresses = async (req, res) => {
  try {
    const addresses = await getAllAddresses();

    return res.status(200).json({
      success: true,
      message: "Addresses fetched successfully",
      data: addresses,
    });
  } catch (error) {
    console.error("Get Addresses Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch addresses",
      error: error.message,
    });
  }
};

// Get Addresses By Customer ID
const getCustomerAddresses = async (req, res) => {
  try {
    const { customerId } = req.params;

    const addresses = await getAddressesByCustomerId(customerId);

    return res.status(200).json({
      success: true,
      message: "Customer addresses fetched successfully",
      data: addresses,
    });
  } catch (error) {
    console.error("Get Customer Addresses Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer addresses",
      error: error.message,
    });
  }
};

// Get Address By ID
const getAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const address = await getAddressById(id);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Address fetched successfully",
      data: address,
    });
  } catch (error) {
    console.error("Get Address Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch address",
      error: error.message,
    });
  }
};

// Update Address
const editAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      customer_id,
      address_type,
      address,
      gst_number,
      city,
      state,
      pincode,
      country,
    } = req.body;

    if (
      !customer_id ||
      !address_type ||
      !address ||
      !city ||
      !state ||
      !pincode
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Customer ID, address type, address, city, state and pincode are required",
      });
    }

    const result = await updateAddress(id, {
      customer_id,
      address_type,
      address,
      gst_number,
      city,
      state,
      pincode,
      country,
    });

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
    });
  } catch (error) {
    console.error("Update Address Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update address",
      error: error.message,
    });
  }
};

// Delete Address
const removeAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await deleteAddress(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Delete Address Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete address",
      error: error.message,
    });
  }
};

module.exports = {
  addAddress,
  getAddresses,
  getCustomerAddresses,
  getAddress,
  editAddress,
  removeAddress,
};