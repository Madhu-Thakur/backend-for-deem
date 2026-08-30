const db = require("../config/db");

// Create Service
const createService = async (serviceData) => {
  const {
    customer_id,
    service_type,
    domain,
    renewal_date,
    duration,
    expiry_date,
    renewal_amount,
    service_status,
  } = serviceData;

  const [result] = await db.execute(
    `
      INSERT INTO service_table
      (
        customer_id,
        service_type,
        domain,
        renewal_date,
        duration,
        expiry_date,
        renewal_amount,
        service_status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      customer_id,
      service_type,
      domain || null,
      renewal_date || null,
      duration || null,
      expiry_date || null,
      renewal_amount || null,
      service_status || "Active",
    ],
  );

  return result.insertId;
};

// Get All Services
const getAllServices = async () => {
  const [rows] = await db.execute(
    `
      SELECT
        id,
        customer_id,
        service_type,
        domain,
        renewal_date,
        duration,
        expiry_date,
        renewal_amount,
        service_status,
        created_at,
        updated_at
      FROM service_table
      ORDER BY id DESC
    `,
  );

  return rows;
};

// Get Services By Customer ID
const getServicesByCustomerId = async (customerId) => {
  const [rows] = await db.execute(
    `
      SELECT
        id,
        customer_id,
        service_type,
        domain,
        renewal_date,
        duration,
        expiry_date,
        renewal_amount,
        service_status,
        created_at,
        updated_at
      FROM service_table
      WHERE customer_id = ?
      ORDER BY id DESC
    `,
    [customerId],
  );

  return rows;
};

// Get Service By ID
const getServiceById = async (id) => {
  const [rows] = await db.execute(
    `
      SELECT
        id,
        customer_id,
        service_type,
        domain,
        renewal_date,
        duration,
        expiry_date,
        renewal_amount,
        service_status,
        created_at,
        updated_at
      FROM service_table
      WHERE id = ?
    `,
    [id],
  );

  return rows[0];
};

// Update Service
const updateService = async (id, serviceData) => {
  const {
    customer_id,
    service_type,
    domain,
    renewal_date,
    duration,
    expiry_date,
    renewal_amount,
    service_status,
  } = serviceData;

  const [result] = await db.execute(
    `
      UPDATE service_table
      SET
        customer_id = ?,
        service_type = ?,
        domain = ?,
        renewal_date = ?,
        duration = ?,
        expiry_date = ?,
        renewal_amount = ?,
        service_status = ?
      WHERE id = ?
    `,
    [
      customer_id,
      service_type,
      domain || null,
      renewal_date || null,
      duration || null,
      expiry_date || null,
      renewal_amount || null,
      service_status || "Active",
      id,
    ],
  );

  return result;
};

// Delete Service
const deleteService = async (id) => {
  const [result] = await db.execute(
    `
      DELETE FROM service_table
      WHERE id = ?
    `,
    [id],
  );

  return result;
};

module.exports = {
  createService,
  getAllServices,
  getServicesByCustomerId,
  getServiceById,
  updateService,
  deleteService,
};