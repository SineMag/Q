import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const aiApi = {
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

  simplifyClinicalNotes: async (clinicalNotes: string) => {
    const response = await axios.post(`${API_BASE_URL}/api/ai/simplify-notes`, {
      clinicalNotes,
    });
    return response.data;
  },

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
