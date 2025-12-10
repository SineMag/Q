import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const aiApi = {
  // Translate medical terminology to patient-friendly language
  translateMedicalText: async (
    medicalText: string,
    language: string = "english"
  ) => {
    const response = await axios.post(`${API_BASE_URL}/api/ai/translate`, {
      medicalText,
      language,
    });
    return response.data;
  },

  // Generate patient explanation for condition/treatment
  generateExplanation: async (
    condition: string,
    treatment: string,
    nextSteps?: string
  ) => {
    const response = await axios.post(`${API_BASE_URL}/api/ai/explain`, {
      condition,
      treatment,
      nextSteps,
    });
    return response.data;
  },

  // Simplify clinical notes for patients
  simplifyClinicalNotes: async (clinicalNotes: string) => {
    const response = await axios.post(`${API_BASE_URL}/api/ai/simplify-notes`, {
      clinicalNotes,
    });
    return response.data;
  },

  // Generate personalized care plan
  generateCarePlan: async (
    condition: string,
    patientAge: string,
    mobilityLevel: string
  ) => {
    const response = await axios.post(`${API_BASE_URL}/api/ai/care-plan`, {
      condition,
      patientAge,
      mobilityLevel,
    });
    return response.data;
  },
};
