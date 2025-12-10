import express from "express";
import { LlamaHealthcareService } from "../services/llamaService.js";

const router = express.Router();

// Translate medical terminology to patient-friendly language
router.post("/translate", async (req, res) => {
  try {
    const { medicalText, language = "english" } = req.body;

    if (!medicalText) {
      return res.status(400).json({ error: "Medical text is required" });
    }

    const translatedText =
      await LlamaHealthcareService.translateMedicalToPatientFriendly(
        medicalText,
        language
      );

    res.json({ translatedText });
  } catch (error) {
    console.error("Translation error:", error);
    res.status(500).json({ error: "Failed to translate medical text" });
  }
});

// Generate patient explanation for condition/treatment
router.post("/explain", async (req, res) => {
  try {
    const { condition, treatment, nextSteps } = req.body;

    if (!condition || !treatment) {
      return res
        .status(400)
        .json({ error: "Condition and treatment are required" });
    }

    const explanation = await LlamaHealthcareService.generatePatientExplanation(
      condition,
      treatment,
      nextSteps || "Follow up with your healthcare provider"
    );

    res.json({ explanation });
  } catch (error) {
    console.error("Explanation error:", error);
    res.status(500).json({ error: "Failed to generate explanation" });
  }
});

// Simplify clinical notes for patients
router.post("/simplify-notes", async (req, res) => {
  try {
    const { clinicalNotes } = req.body;

    if (!clinicalNotes) {
      return res.status(400).json({ error: "Clinical notes are required" });
    }

    const simplifiedNotes = await LlamaHealthcareService.simplifyClinicalNotes(
      clinicalNotes
    );

    res.json({ simplifiedNotes });
  } catch (error) {
    console.error("Notes simplification error:", error);
    res.status(500).json({ error: "Failed to simplify clinical notes" });
  }
});

// Generate personalized care plan
router.post("/care-plan", async (req, res) => {
  try {
    const { condition, patientAge, mobilityLevel } = req.body;

    if (!condition) {
      return res.status(400).json({ error: "Condition is required" });
    }

    const carePlan = await LlamaHealthcareService.generateCarePlan(
      condition,
      patientAge || "adult",
      mobilityLevel || "normal"
    );

    res.json({ carePlan });
  } catch (error) {
    console.error("Care plan generation error:", error);
    res.status(500).json({ error: "Failed to generate care plan" });
  }
});

export default router;
