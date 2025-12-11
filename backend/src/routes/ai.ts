import express from "express";
import { LlamaHealthcareService } from "../services/llamaService.js";
import { authenticate, requireRole, AuthRequest } from "../middleware/auth.js";

const router = express.Router();

router.post("/translate", authenticate, requireRole(['admin', 'patient']), async (req: AuthRequest, res) => {
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

router.post("/explain", authenticate, requireRole(['admin', 'patient']), async (req: AuthRequest, res) => {
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

router.post("/simplify-notes", authenticate, requireRole(['admin', 'patient']), async (req: AuthRequest, res) => {
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

router.post("/care-plan", authenticate, requireRole(['admin', 'patient']), async (req: AuthRequest, res) => {
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

router.post("/chat", authenticate, requireRole(['admin', 'patient']), async (req: AuthRequest, res) => {
  try {
    const { message, patientName } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await LlamaHealthcareService.chat(message, patientName);

    res.json({ message: response });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Failed to generate chat response" });
  }
});

export default router;
