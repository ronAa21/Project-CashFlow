import express from "express";
import { pool } from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Manager onlu middleware
function managerOnly(req, res, next) {
  if(req.user.role === "manager") {
    next();
  } else {
    return res.status(403).json({ error: "Unauthorized" });
  }
}

function check(req, res, next) {
  const headers = req.headers.authorization;

  if(!headers) {
    return res.status(500).json({ error: "No token" });
  }

  const token = headers.split(" ")[1];

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    console.log(user);
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

// for sign up
router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    // check if email exits
    const [customers] = await pool.query(
      'select * from customers where email = ?', [email]
    );

    if(customers.length === 0) {
      return res.status(403).json({
        message: "Email not registered by manager"
      });
    };

    const customerId = customers[0].id;

    const [users] = await pool.query(
      "select id from users where email = ?", [email]
    );

    if(users.length > 0) {
      return res.status(403).json({
        message: "User already exists"
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    await pool.query(
      'insert into users (email, password_hash, customer_id) values (?, ?, ?)', [email, hashed, customerId]
    );

    res.status(201).json({
      message: "signed up",
      user: email
    });

  } catch (error) {
    console.error("Insert error", error);
    res.status(500).json({ error: "failed" });
  }
});

// for login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const [rows] = await pool.query(
    "select id, password_hash, role, customer_id from users where email = ?", [email]
  );

  if (rows.length === 0) {
    return res.status(404).json({ message: "User not found" });
  }

  const user = rows[0]; 

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (isPasswordValid) {
    const token = jwt.sign({
       userId: user.id, 
       role: user.role, 
       customerId: user.customer_id || null },
       process.env.JWT_SECRET, 
       { expiresIn: "24h" });
    return res.json({ 
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: email,
        role: user.role,
        customerId: user.customer_id
      }
     });
  } else {
    return res.status(401).json({ message: "Invalid credentials" });
  }
});

// display orders (For Customer view)
router.get("/vieworders", check, async (req, res) => {
  try {
    const customerId = req.user.customerId;

    const [rows] = await pool.query(`
      SELECT 
        o.id AS order_id,
        o.order_name,
        o.order_type,
        o.fabric_type,
        o.status,
        o.created_at,
        c.full_name,
        c.phone_number,
        c.sets,
        c.remarks
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      WHERE o.customer_id = ?
    `, [customerId]);

    res.json(rows)
  } catch (error) {
      console.error("Retrieve error", error);
      res.status(500).json({ error: "failed" });
  }
});

// display measurements
router.get("/orders/:orderId/measurements", check, async (req, res) => {
  const { orderId } = req.params;

  const [order] = await pool.query(
    "select order_name from orders where id = ?", [orderId]
  )

  if(!order.length) {
    return res.status(404).json({ message: "Order not found" });
  }

  const rawName = order[0].order_name || "";
  const normalizedOrderName = rawName.toLowerCase().trim().replace(/ /g, "_");
  
  console.log("Database says:", rawName); // Useful for debugging
  console.log("Switching on:", normalizedOrderName);

  let measurements;

  switch(normalizedOrderName) {
    case "short_sleeve":
      [measurements] = await pool.query(
        'select * from short_sleeve_measurements where order_id = ?', [orderId]
      );
      break;

    case "long_sleeve":
      [measurements] = await pool.query(
        'select * from long_sleeve_measurements where order_id = ?', [orderId]
      );
      break;

    case "pants":
      [measurements] = await pool.query(
        'select * from pants_measurements where order_id = ?', [orderId]
      );
      break;

    default:
      return res.status(400).json({ error: "Invalid order type" });
  }

  res.json(measurements[0] || {});
})

// updates status
router.put("/updateorders/:id/status", check, managerOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const [order] = await pool.query(
      "UPDATE orders SET status = ? WHERE id = ?", [status, id]
    )

    res.json({ 
      message: "Status updated successfully", 
      orderId: id, 
      newStatus: status 
    });
  } catch (error) {
    console.error(error); 
    return res.status(400).json({ error: error});
  }
});

// view orders (For Manager view)
router.get("/viewallorders", check, managerOnly, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        o.id AS order_id,
        o.order_name,
        o.order_type,
        o.fabric_type,
        o.status,
        o.created_at,
        c.id AS customer_id,
        c.full_name,
        c.email,
        c.phone_number,
        c.sets,
        c.remarks
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
    `);

    res.json(rows)
  } catch (error) {
      console.error("Retrieve error", error);
      res.status(500).json({ error: "failed" });
  }
})

// add customers
router.post("/addcustomers", check, managerOnly, async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { customer, orders } = req.body;

    await connection.beginTransaction();

    const [result] = await connection.query(
      'insert into customers (full_name, email, phone_number, sets, remarks) values (?, ?, ?, ?, ?)', [customer.name, customer.email, customer.phone, customer.set, customer.remarks]
    );

    const customerId = result.insertId;

      for(const order of orders) {
        const [orderResult] = await connection.query(
          'insert into orders (customer_id, order_name, order_type, fabric_type) values (?, ?, ?, ?)', [customerId, order.name, order.type, order.fabric]
        );

      const orderId = orderResult.insertId;

      if(order.name === "short_sleeve") {
        await connection.query(
          'insert into short_sleeve_measurements (order_id, shoulder, sleeve_length, sleeve_opening, arm_hole, length, bust, waist_line, hips, collar) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            orderId,
            order.measurement.shoulder,
            order.measurement.sleeveLength,
            order.measurement.sleeveOpening,
            order.measurement.armHole,
            order.measurement.length,
            order.measurement.bust,
            order.measurement.waistline,
            order.measurement.hips,
            order.measurement.collar
          ]
        );
      }

      if(order.name === "long_sleeve") {
        await connection.query(
          'insert into long_sleeve_measurements (order_id, shoulder, sleeve_length, cuff, arm_hole, length, bust, waist_line, hips, collar) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            orderId,
            order.measurement.shoulder,
            order.measurement.sleeveLength,
            order.measurement.cuff,
            order.measurement.armHole,
            order.measurement.length,
            order.measurement.bust,
            order.measurement.waistline,
            order.measurement.hips,
            order.measurement.collar
          ]
        );
      }

      if(order.name === "pants") {
        await connection.query(
          'insert into pants_measurements (order_id, crotch, length, waist_line, hips, thigh, knee, bottom) values (?, ?, ?, ?, ?, ?, ?, ?)', [
            orderId,
            order.measurement.crotch,
            order.measurement.ptslength,
            order.measurement.ptsWaistline,
            order.measurement.ptsHips,
            order.measurement.thigh,
            order.measurement.knee,
            order.measurement.bottom
          ]
        )
      }
    }

    await connection.commit();
    res.status(201).json({ message: "success" });

  } catch (error) {
    await connection.rollback();
    console.error("Insert error", error);
    res.status(500).json({   error: error.message,
  sql: error.sqlMessage });
  } finally {
    connection.release();
  }
  
});

// save cashflow
router.post("/savecashflow", check, managerOnly, async (req, res) => {
  try {
    const { initial, date, description, input, output } = req.body;

    const [rows] = await pool.query(
      'insert into cashflow_ledger (initial_val, entry_date, description, amount_in, amount_out) values (?, ?, ?, ?, ?)', [initial, date, description, input, output]
    );

    res.json({
      message: "success",
      id: rows.insertId
    });

  } catch (error) {
    console.error("Insert error", error);
    res.status(500).json({ error: error.message });
  }
});

// get the cashflow data
router.get("/viewcashflow", check, managerOnly, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "select * from cashflow_ledger"
    );

    res.json(rows);
  } catch (error) {
    console.error("Retrieve error", error);
    res.status(401).json({ error: error });
  }
});

// for clearing cashflow data
router.delete("/clear/cashflow", check, managerOnly, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "truncate table cashflow_ledger"
    );

    res.json({
      message: "deleted",
    });

    console.log("Deleted")
  } catch (error) {
    console.error("Delete error", error);
    res.status(500).json({ error: error.message });
  }
})

router.post("/manager/send", check, managerOnly, async (req, res) => {
  try {
    const { customerId, message } = req.body;
    const manager = "manager";

    const [rows] = await pool.query(
      'insert into chats (customer_id, sender, message) values (?, ?, ?)', [customerId, manager, message]
    );

    res.json({
      message: "sent",
      id: rows.insertId
    });

  } catch (error) {
    console.error("Insert error", error);
    res.status(500).json({ error: error.message });
  };
});

// for sending chats (Customer)
router.post("/customer/send", check, async (req, res) => {
  try {
    const { message } = req.body;
    const myId = req.user.customerId;
    const customer = "customer";

    const [rows] = await pool.query(
      'insert into chats (customer_id, sender, message) values (?, ?, ?)', [myId,customer, message]
    );

    res.json({
      message: "sent",
      id: rows.insertId
    });
  } catch (error) {
    console.error("Not sent: ", error);
    res.status(500).json({ error: error.message });
  }
})

// load chats (For manager)
router.get("/loadchats/:id", check, async (req, res) => {
  try {
    const id = req.params.id;

    const [rows] = await pool.query(
      "SELECT * FROM chats WHERE customer_id = ? ORDER BY created_at ASC", [id]
    );

    res.json(rows)
  } catch (error) {
    console.error("Retrieve error", error);
    res.status(401).json({ error: error });
  }
});

// load user specific chats (For customers)
router.get("/customer/loadchats", check, async (req, res) => {
  try {
    const customerId = req.user.customerId;

    const [rows] = await pool.query(
      "SELECT * FROM chats WHERE customer_id = ? ORDER BY created_at ASC", [customerId]
    );

    res.json(rows);
  } catch (error) {
    console.error("Retrieve error", error);
    res.status(401).json({ error: error });
  }
});

// for customer chats
router.get("/current-user", check, (req, res) => {
  res.json({ id: req.user.customerId  });
});

// for changing password
router.put("/changepass", check, async (req, res) => {
  try {
    const customerId = req.user.customerId
    const { changePass } = req.body;

    const hashed = await bcrypt.hash(changePass, 10);

    const [rows] = await pool.query(
      "update users set password_hash = ? where customer_id = ?", [hashed, customerId]
    );

    res.json({
      message: "Password changed successfully",
      id: rows.insertId
    });

    console.log("Password changed successfully");
  } catch (error) {
    console.error("Insert error", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;