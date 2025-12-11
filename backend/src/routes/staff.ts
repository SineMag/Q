import express, { Request, Response } from "express";
import { pool } from "../db/index.js";
import { authenticate, requireRole, AuthRequest } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authenticate, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { name, role, is_available } = req.body;
    if (!name || !role) {
      return res.status(400).json({ error: "Name and role are required" });
    }
    const result = await pool.query(
      `INSERT INTO staff (name, role, is_available)
       VALUES ($1, $2, $3)
        RETURNING *`,
      [name, role, is_available !== undefined ? is_available : true]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating staff member:", error);
    res.status(500).json({ error: "Failed to create staff member" });
  }
});

router.get("/", authenticate, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT s.*, 
              p.first_name as current_patient_first_name,
              p.last_name as current_patient_last_name
       FROM staff s
       LEFT JOIN queue q ON s.current_patient_id = q.id
       LEFT JOIN patients p ON q.patient_id = p.id
       ORDER BY s.name`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching staff:", error);
    res.status(500).json({ error: "Failed to fetch staff" });
  }
});

router.get("/available", authenticate, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT * FROM staff WHERE is_available = true ORDER BY name"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching available staff:", error);
    res.status(500).json({ error: "Failed to fetch available staff" });
  }
});

router.put("/:id/availability", authenticate, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { is_available } = req.body;

    const result = await pool.query(
      `UPDATE staff 
       SET is_available = $1,
           current_patient_id = CASE WHEN $1 = false THEN current_patient_id ELSE NULL END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [is_available, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Staff member not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating staff availability:", error);
    res.status(500).json({ error: "Failed to update staff availability" });
  }
});

export default router;
