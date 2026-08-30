const {
  createService,
  getAllServices,
  getServicesByCustomerId,
  getServiceById,
  updateService,
  deleteService,
} = require("../models/serviceModel");

// Create Service
const addService = async (req, res) => {
  try {
    const {
      customer_id,
      service_type,
      domain,
      renewal_date,
      duration,
      expiry_date,
      renewal_amount,
      service_status,
    } = req.body;

    if (!customer_id || !service_type) {
      return res.status(400).json({
        success: false,
        message: "Customer ID and service type are required",
      });
    }

    const serviceId = await createService({
      customer_id,
      service_type,
      domain,
      renewal_date,
      duration,
      expiry_date,
      renewal_amount,
      service_status,
    });

    return res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: {
        id: serviceId,
      },
    });
  } catch (error) {
    console.error("Create Service Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create service",
      error: error.message,
    });
  }
};

// Get All Services
const getServices = async (req, res) => {
  try {
    const services = await getAllServices();

    return res.status(200).json({
      success: true,
      message: "Services fetched successfully",
      data: services,
    });
  } catch (error) {
    console.error("Get Services Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch services",
      error: error.message,
    });
  }
};

// Get Services By Customer ID
const getCustomerServices = async (req, res) => {
  try {
    const { customerId } = req.params;

    const services = await getServicesByCustomerId(customerId);

    return res.status(200).json({
      success: true,
      message: "Customer services fetched successfully",
      data: services,
    });
  } catch (error) {
    console.error("Get Customer Services Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer services",
      error: error.message,
    });
  }
};

// Get Service By ID
const getService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await getServiceById(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Service fetched successfully",
      data: service,
    });
  } catch (error) {
    console.error("Get Service Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch service",
      error: error.message,
    });
  }
};

// Update Service
const editService = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      customer_id,
      service_type,
      domain,
      renewal_date,
      duration,
      expiry_date,
      renewal_amount,
      service_status,
    } = req.body;

    if (!customer_id || !service_type) {
      return res.status(400).json({
        success: false,
        message: "Customer ID and service type are required",
      });
    }

    const result = await updateService(id, {
      customer_id,
      service_type,
      domain,
      renewal_date,
      duration,
      expiry_date,
      renewal_amount,
      service_status,
    });

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Service updated successfully",
    });
  } catch (error) {
    console.error("Update Service Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update service",
      error: error.message,
    });
  }
};

// Delete Service
const removeService = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await deleteService(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("Delete Service Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete service",
      error: error.message,
    });
  }
};

module.exports = {
  addService,
  getServices,
  getCustomerServices,
  getService,
  editService,
  removeService,
};