const db = require("../config/db");

// Create Address
const createAddress = async (addressData) => {
  const {
    customer_id,
    address_type,
    address,
    gst_number,
    city,
    state,
    pincode,
    country,
  } = addressData;

  const [result] = await db.execute(
    `
      INSERT INTO address_table
      (
        customer_id,
        address_type,
        address,
        gst_number,
        city,
        state,
        pincode,
        country
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      customer_id,
      address_type,
      address,
      gst_number || null,
      city,
      state,
      pincode,
      country || "India",
    ],
  );

  return result.insertId;
};

// Get All Addresses
const getAllAddresses = async () => {
  const [rows] = await db.execute(
    `
      SELECT
        id,
        customer_id,
        address_type,
        address,
        gst_number,
        city,
        state,
        pincode,
        country,
        created_at,
        updated_at
      FROM address_table
      ORDER BY id DESC
    `,
  );

  return rows;
};

// Get Addresses By Customer ID
const getAddressesByCustomerId = async (customerId) => {
  const [rows] = await db.execute(
    `
      SELECT
        id,
        customer_id,
        address_type,
        address,
        gst_number,
        city,
        state,
        pincode,
        country,
        created_at,
        updated_at
      FROM address_table
      WHERE customer_id = ?
      ORDER BY id DESC
    `,
    [customerId],
  );

  return rows;
};

// Get Address By ID
const getAddressById = async (id) => {
  const [rows] = await db.execute(
    `
      SELECT
        id,
        customer_id,
        address_type,
        address,
        gst_number,
        city,
        state,
        pincode,
        country,
        created_at,
        updated_at
      FROM address_table
      WHERE id = ?
    `,
    [id],
  );

  return rows[0];
};

// Update Address
const updateAddress = async (id, addressData) => {
  const {
    customer_id,
    address_type,
    address,
    gst_number,
    city,
    state,
    pincode,
    country,
  } = addressData;

  const [result] = await db.execute(
    `
      UPDATE address_table
      SET
        customer_id = ?,
        address_type = ?,
        address = ?,
        gst_number = ?,
        city = ?,
        state = ?,
        pincode = ?,
        country = ?
      WHERE id = ?
    `,
    [
      customer_id,
      address_type,
      address,
      gst_number || null,
      city,
      state,
      pincode,
      country || "India",
      id,
    ],
  );

  return result;
};

// Delete Address
const deleteAddress = async (id) => {
  const [result] = await db.execute(
    `
      DELETE FROM address_table
      WHERE id = ?
    `,
    [id],
  );

  return result;
};

module.exports = {
  createAddress,
  getAllAddresses,
  getAddressesByCustomerId,
  getAddressById,
  updateAddress,
  deleteAddress,
};