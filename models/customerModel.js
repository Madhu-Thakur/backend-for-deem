const db = require("../config/db");

const createCustomer = async (customerData) => {
  const { customer_name, company_name, phone, email, status } = customerData;

  const [result] = await db.execute(
    `
      INSERT INTO customers
      (customer_name, company_name, phone, email, status)
      VALUES (?, ?, ?, ?, ?)
    `,
    [
      customer_name,
      company_name || null,
      phone,
      email,
      status || "Active",
    ],
  );

  return result.insertId;
};

const getAllCustomers = async () => {
  const [rows] = await db.execute(
    `
      SELECT
        id,
        customer_name,
        company_name,
        phone,
        email,
        status,
        created_at,
        updated_at
      FROM customers
      ORDER BY id DESC
    `,
  );

  return rows;
};

const getCustomerById = async (id) => {
  const [rows] = await db.execute(
    `
      SELECT
        id,
        customer_name,
        company_name,
        phone,
        email,
        status,
        created_at,
        updated_at
      FROM customers
      WHERE id = ?
    `,
    [id],
  );

  return rows[0];
};

const updateCustomer = async (id, customerData) => {
  const { customer_name, company_name, phone, email, status } = customerData;

  const [result] = await db.execute(
    `
      UPDATE customers
      SET
        customer_name = ?,
        company_name = ?,
        phone = ?,
        email = ?,
        status = ?
      WHERE id = ?
    `,
    [
      customer_name,
      company_name || null,
      phone,
      email,
      status,
      id,
    ],
  );

  return result;
};

const deleteCustomer = async (id) => {
  const [result] = await db.execute(
    `
      DELETE FROM customers
      WHERE id = ?
    `,
    [id],
  );

  return result;
};

module.exports = {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};