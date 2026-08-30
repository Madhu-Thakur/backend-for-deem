const db = require("../config/db");
 
const generateInvoiceNumber = async (
  connection,
) => {
  const year = new Date().getFullYear();

  const [rows] = await connection.execute(
    `
      SELECT invoice_number
      FROM invoices
      WHERE invoice_number LIKE ?
      ORDER BY id DESC
      LIMIT 1
    `,
    [`INV-${year}-%`],
  );

  let nextNumber = 1;

  if (rows.length > 0) {
    const lastInvoiceNumber =
      rows[0].invoice_number;

    const lastNumber = parseInt(
      lastInvoiceNumber.split("-").pop(),
      10,
    );

    if (!Number.isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  return `INV-${year}-${String(
    nextNumber,
  ).padStart(4, "0")}`;
};
 
const createInvoice = async (
  invoiceData,
  items,
) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const invoiceNumber =
      await generateInvoiceNumber(connection);

    const {
      customer_id,
      address_id,
      invoice_date,
      payment_mode,
      payment_status,
      subtotal,
      cgst,
      sgst,
      igst,
      grand_total,
      note,
    } = invoiceData;

    const [invoiceResult] =
      await connection.execute(
        `
          INSERT INTO invoices
          (
            customer_id,
            address_id,
            invoice_number,
            invoice_date,
            payment_mode,
            payment_status,
            subtotal,
            cgst,
            sgst,
            igst,
            grand_total,
            note
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          customer_id,
          address_id,
          invoiceNumber,
          invoice_date,
          payment_mode,
          payment_status || "Pending",
 
          subtotal || 0,

          cgst || 0,
          sgst || 0,
          igst || 0,
          grand_total || 0,

          note || null,
        ],
      );

    const invoiceId =
      invoiceResult.insertId;

    for (const item of items) {
      await connection.execute(
        `
          INSERT INTO invoice_items
          (
            invoice_id,
            item_name,
            hsn,
            amount
          )
          VALUES (?, ?, ?, ?)
        `,
        [
          invoiceId,
          item.item_name,
          item.hsn || null,
          item.amount || 0,
        ],
      );
    }

    await connection.commit();

    return {
      id: invoiceId,
      invoice_number: invoiceNumber,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
 
const getAllInvoices = async () => {
  const [rows] = await db.execute(
    `
      SELECT
        i.id,
        i.invoice_number,
        i.customer_id,
        c.customer_name,
        i.address_id,
        i.invoice_date,
        i.payment_mode,
        i.payment_status,
        i.cgst,
        i.sgst,
        i.igst,
        i.grand_total,
        i.note,
        i.created_at,
        i.updated_at
      FROM invoices i
      INNER JOIN customers c
        ON i.customer_id = c.id
      ORDER BY i.id DESC
    `,
  );

  return rows;
};
 
const getInvoiceById = async (id) => {
  const [invoiceRows] =
    await db.execute(
      `
        SELECT
          i.id,
          i.invoice_number,
          i.customer_id,
          c.customer_name,

          i.address_id,

          a.address,
          a.city,
          a.state,
          a.pincode,
          a.country,
          a.gst_number,

          i.invoice_date,
          i.payment_mode,
          i.payment_status,

          i.subtotal,
          i.cgst,
          i.sgst,
          i.igst,
          i.grand_total,

          i.note,
          i.created_at,
          i.updated_at

        FROM invoices i

        INNER JOIN customers c
          ON i.customer_id = c.id

        LEFT JOIN address_table a
          ON i.address_id = a.id

        WHERE i.id = ?
      `,
      [id],
    );

  if (invoiceRows.length === 0) {
    return null;
  }

  const [items] =
    await db.execute(
      `
        SELECT
          id,
          invoice_id,
          item_name,
          hsn,
          amount,
          created_at
        FROM invoice_items
        WHERE invoice_id = ?
        ORDER BY id ASC
      `,
      [id],
    );

  const invoice = invoiceRows[0];

  return {
    ...invoice,

    // Keep address together for frontend/PDF.
    address: {
      id: invoice.address_id,
      address: invoice.address,
      city: invoice.city,
      state: invoice.state,
      pincode: invoice.pincode,
      country: invoice.country,
      gst_number: invoice.gst_number,
    },

    items,
  };
};
 
const updateInvoice = async (
  id,
  invoiceData,
  items,
) => {
  const connection =
    await db.getConnection();

  try {
    await connection.beginTransaction();

    const {
      customer_id,
      address_id,
      invoice_date,
      payment_mode,
      payment_status,
      subtotal,
      cgst,
      sgst,
      igst,
      grand_total,
      note,
    } = invoiceData;

    const [result] =
      await connection.execute(
        `
          UPDATE invoices
          SET
            customer_id = ?,
            address_id = ?,
            invoice_date = ?,
            payment_mode = ?,
            payment_status = ?,
            subtotal = ?,
            cgst = ?,
            sgst = ?,
            igst = ?,
            grand_total = ?,
            note = ?
          WHERE id = ?
        `,
        [
          customer_id,
          address_id,
          invoice_date,
          payment_mode,
          payment_status || "Pending",

          subtotal || 0,
          cgst || 0,
          sgst || 0,
          igst || 0,
          grand_total || 0,

          note || null,

          id,
        ],
      );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return false;
    }

    // Remove old items
    await connection.execute(
      `
        DELETE FROM invoice_items
        WHERE invoice_id = ?
      `,
      [id],
    );

    // Insert updated items
    for (const item of items) {
      await connection.execute(
        `
          INSERT INTO invoice_items
          (
            invoice_id,
            item_name,
            hsn,
            amount
          )
          VALUES (?, ?, ?, ?)
        `,
        [
          id,
          item.item_name,
          item.hsn || null,
          item.amount || 0,
        ],
      );
    }

    await connection.commit();

    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
 
const deleteInvoice = async (id) => {
  const [result] = await db.execute(
    `
      DELETE FROM invoices
      WHERE id = ?
    `,
    [id],
  );

  return result;
};
 
module.exports = {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
};