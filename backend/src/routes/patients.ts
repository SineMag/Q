import express from "express";
import { pool } from "../db/index.js";
import { broadcastUpdate } from "../index.js";

const router = express.Router();
// CRUD operations for patients..

// Get all patients
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

// Get patient by ID
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

// Create new patient
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

// Update patient
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

// Delete patient
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
