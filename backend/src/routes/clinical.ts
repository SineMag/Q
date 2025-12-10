import express from "express";
import { LlamaHealthcareService } from "../services/llamaService.js";
import { pool } from "../db/index.js";

const router = express.Router();

// AI-powered clinical documentation assistant
router.post("/document-encounter", async (req, res) => {
  try {
    const {
      patientId,
      staffId,
      encounterType,
      symptoms,
      examination,
      diagnosis,
      treatment,
      notes,
    } = req.body;

    if (!patientId || !staffId || !encounterType) {
      return res
        .status(400)
        .json({
          error: "Patient ID, Staff ID, and encounter type are required",
        });
    }

    // Generate structured clinical documentation using AI
    const structuredNotes =
      await LlamaHealthcareService.generateClinicalDocumentation({
        encounterType,
        symptoms,
        examination,
        diagnosis,
        treatment,
        notes,
      });

    // Save the encounter to database
    const result = await pool.query(
      `
      INSERT INTO clinical_encounters 
      (patient_id, staff_id, encounter_type, symptoms, examination, diagnosis, treatment, notes, structured_notes, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
      RETURNING *
    `,
      [
        patientId,
        staffId,
        encounterType,
        symptoms,
        examination,
        diagnosis,
        treatment,
        notes,
        structuredNotes,
      ]
    );

    res.json({
      encounter: result.rows[0],
      structuredNotes,
    });
  } catch (error) {
    console.error("Documentation error:", error);
    res.status(500).json({ error: "Failed to document encounter" });
  }
});

// AI-powered discharge summary generator
router.post("/generate-discharge-summary", async (req, res) => {
  try {
    const { patientId, encounterIds } = req.body;

    if (!patientId) {
      return res.status(400).json({ error: "Patient ID is required" });
    }

    // Fetch patient encounters
    const encountersResult = await pool.query(
      `
      SELECT * FROM clinical_encounters 
      WHERE patient_id = $1 
      ORDER BY created_at DESC
      LIMIT 10
    `,
      [patientId]
    );

    // Generate discharge summary using AI
    const dischargeSummary =
      await LlamaHealthcareService.generateDischargeSummary(
        encountersResult.rows
      );

    res.json({ dischargeSummary });
  } catch (error) {
    console.error("Discharge summary error:", error);
    res.status(500).json({ error: "Failed to generate discharge summary" });
  }
});

// AI-powered prescription instructions simplifier
router.post("/simplify-prescription", async (req, res) => {
  try {
    const { prescription, patientAge, patientLiteracy } = req.body;

    if (!prescription) {
      return res
        .status(400)
        .json({ error: "Prescription details are required" });
    }

    const simplifiedInstructions =
      await LlamaHealthcareService.simplifyPrescriptionInstructions(
        prescription,
        patientAge || "adult",
        patientLiteracy || "normal"
      );

    res.json({ simplifiedInstructions });
  } catch (error) {
    console.error("Prescription simplification error:", error);
    res.status(500).json({ error: "Failed to simplify prescription" });
  }
});

// Get clinical encounters for a patient
router.get("/encounters/:patientId", async (req, res) => {
  try {
    const { patientId } = req.params;

    const result = await pool.query(
      `
      SELECT ce.*, s.name as staff_name, s.role as staff_role
      FROM clinical_encounters ce
      JOIN staff s ON ce.staff_id = s.id
      WHERE ce.patient_id = $1
      ORDER BY ce.created_at DESC
    `,
      [patientId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching encounters:", error);
    res.status(500).json({ error: "Failed to fetch encounters" });
  }
});

// Get staff workload and administrative burden metrics
router.get("/staff-workload/:staffId", async (req, res) => {
  try {
    const { staffId } = req.params;
    const { timeframe = "7" } = req.query;

    const result = await pool.query(
      `
      SELECT 
        COUNT(*) as total_encounters,
        AVG(LENGTH(notes)) as avg_documentation_length,
        COUNT(CASE WHEN encounter_type = 'follow_up' THEN 1 END) as follow_ups,
        COUNT(CASE WHEN encounter_type = 'initial' THEN 1 END) as initial_visits,
        COUNT(CASE WHEN encounter_type = 'emergency' THEN 1 END) as emergencies
      FROM clinical_encounters 
      WHERE staff_id = $1 
      AND created_at >= CURRENT_DATE - INTERVAL '${timeframe} days'
    `,
      [staffId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching workload:", error);
    res.status(500).json({ error: "Failed to fetch workload data" });
  }
});

export default router;
