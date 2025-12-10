import express from "express";
import { pool } from "../db/index.js";
import bcrypt from "bcrypt";

const router = express.Router();

function generatePatientId(): string {
  const prefix = "QH";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `${prefix}${timestamp}${random}`;
}

router.post("/register", async (req, res) => {
  try {
    const { full_name, national_id, password, email, phone_number } = req.body;

    if (!full_name || !national_id || !password || !email) {
      return res
        .status(400)
        .json({ error: "All required fields must be provided" });
    }

    const existingPatient = await pool.query(
      "SELECT id FROM patients WHERE email = $1 OR national_id = $2",
      [email, national_id]
    );

    if (existingPatient.rows.length > 0) {
      return res.status(400).json({
        error: "Patient with this email or national ID already exists",
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const patient_id = generatePatientId();

    const result = await pool.query(
      `INSERT INTO patients (full_name, national_id, password, email, phone_number, patient_id, profile_complete, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, false, CURRENT_TIMESTAMP)
       RETURNING id, full_name, email, patient_id, profile_complete`,
      [full_name, national_id, hashedPassword, email, phone_number, patient_id]
    );

    res.status(201).json({
      message: "Patient registered successfully",
      patient: result.rows[0],
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Failed to register patient" });
  }
});

router.put("/:id/profile", async (req, res) => {
  try {
    const { id } = req.params;
    const { address, medical_aid, payment_method } = req.body;

    if (!address || !payment_method) {
      return res
        .status(400)
        .json({ error: "Address and payment method are required" });
    }

    const result = await pool.query(
      `UPDATE patients 
       SET address = $1, medical_aid = $2, payment_method = $3, profile_complete = true, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, full_name, email, patient_id, address, medical_aid, payment_method, profile_complete`,
      [address, medical_aid, payment_method, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.json({
      message: "Profile updated successfully",
      patient: result.rows[0],
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM patients ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching patients:", error);
    res.status(500).json({ error: "Failed to fetch patients" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM patients WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching patient:", error);
    res.status(500).json({ error: "Failed to fetch patient" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { first_name, last_name, date_of_birth, phone_number, email } =
      req.body;

    if (!first_name || !last_name) {
      return res
        .status(400)
        .json({ error: "First name and last name are required" });
    }

    const result = await pool.query(
      `INSERT INTO patients (first_name, last_name, date_of_birth, phone_number, email)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        first_name,
        last_name,
        date_of_birth || null,
        phone_number || null,
        email || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating patient:", error);
    res.status(500).json({ error: "Failed to create patient" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, date_of_birth, phone_number, email } =
      req.body;

    const result = await pool.query(
      `UPDATE patients 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           date_of_birth = COALESCE($3, date_of_birth),
           phone_number = COALESCE($4, phone_number),
           email = COALESCE($5, email),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [first_name, last_name, date_of_birth, phone_number, email, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating patient:", error);
    res.status(500).json({ error: "Failed to update patient" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM patients WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.json({ message: "Patient deleted successfully" });
  } catch (error) {
    console.error("Error deleting patient:", error);
    res.status(500).json({ error: "Failed to delete patient" });
  }
});

export default router;
