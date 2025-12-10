import { pipeline } from "@huggingface/transformers";

let llamaPipeline: any = null;

async function initializeLlama() {
  if (!llamaPipeline) {
    try {
      llamaPipeline = await pipeline(
        "text-generation",
        "meta-llama/Llama-2-7b-chat-hf",
        {
          device: "cpu",
          dtype: "q4",
        }
      );
    } catch (error) {
      console.error("Failed to initialize Llama model:", error);
      llamaPipeline = { isMock: true };
    }
  }
  return llamaPipeline;
}

export class LlamaHealthcareService {
  static async translateMedicalToPatientFriendly(
    medicalText: string,
    patientLanguage: string = "english"
  ): Promise<string> {
    await initializeLlama();

    if (llamaPipeline.isMock) {
      return this.getMockTranslation(medicalText);
    }

    const prompt = `Translate this medical information into simple, patient-friendly language that a non-medical person can understand. Use clear, reassuring language. Medical text: "${medicalText}" Language: ${patientLanguage}`;

    try {
      const result = await llamaPipeline(prompt, {
        max_new_tokens: 200,
        temperature: 0.7,
        do_sample: true,
      });

      return result[0]?.generated_text || medicalText;
    } catch (error) {
      console.error("Translation error:", error);
      return medicalText;
    }
  }

  static async generatePatientExplanation(
    condition: string,
    treatment: string,
    nextSteps: string
  ): Promise<string> {
    await initializeLlama();

    if (llamaPipeline.isMock) {
      return this.getMockPatientExplanation(condition, treatment, nextSteps);
    }

    const prompt = `Create a clear, empathetic explanation for a patient about their condition, treatment, and next steps. Use simple language and include reassurance. Condition: ${condition}, Treatment: ${treatment}, Next Steps: ${nextSteps}`;

    try {
      const result = await llamaPipeline(prompt, {
        max_new_tokens: 300,
        temperature: 0.6,
        do_sample: true,
      });

      return (
        result[0]?.generated_text ||
        "Please speak with your healthcare provider for more details."
      );
    } catch (error) {
      console.error("Explanation generation error:", error);
      return "Please speak with your healthcare provider for more details.";
    }
  }

  static async simplifyClinicalNotes(clinicalNotes: string): Promise<string> {
    await initializeLlama();

    if (llamaPipeline.isMock) {
      return this.getMockSimplifiedNotes(clinicalNotes);
    }

    const prompt = `Simplify these clinical notes into patient-friendly language while preserving important information: "${clinicalNotes}"`;

    try {
      const result = await llamaPipeline(prompt, {
        max_new_tokens: 250,
        temperature: 0.5,
        do_sample: true,
      });

      return result[0]?.generated_text || clinicalNotes;
    } catch (error) {
      console.error("Notes simplification error:", error);
      return clinicalNotes;
    }
  }

  static async generateCarePlan(
    condition: string,
    patientAge: string,
    mobilityLevel: string
  ): Promise<string> {
    await initializeLlama();

    if (llamaPipeline.isMock) {
      return this.getMockCarePlan(condition, patientAge, mobilityLevel);
    }

    const prompt = `Generate a simple, actionable care plan for a patient. Consider their age (${patientAge}) and mobility level (${mobilityLevel}). Condition: ${condition}`;

    try {
      const result = await llamaPipeline(prompt, {
        max_new_tokens: 350,
        temperature: 0.6,
        do_sample: true,
      });

      return (
        result[0]?.generated_text ||
        "Please consult with your healthcare provider for a personalized care plan."
      );
    } catch (error) {
      console.error("Care plan generation error:", error);
      return "Please consult with your healthcare provider for a personalized care plan.";
    }
  }

  private static getMockTranslation(medicalText: string): string {
    const translations: { [key: string]: string } = {
      hypertension: "high blood pressure",
      "myocardial infarction": "heart attack",
      "diabetes mellitus": "diabetes (high blood sugar)",
      pneumonia: "lung infection",
      fracture: "broken bone",
    };

    let translated = medicalText.toLowerCase();
    Object.entries(translations).forEach(([medical, simple]) => {
      translated = translated.replace(new RegExp(medical, "g"), simple);
    });

    return translated.charAt(0).toUpperCase() + translated.slice(1);
  }

  private static getMockPatientExplanation(
    condition: string,
    treatment: string,
    nextSteps: string
  ): string {
    return `You have been diagnosed with ${condition}. This is a common condition that we can manage together. The treatment plan involves ${treatment}. For your next steps, please ${nextSteps}. Don't worry - we're here to support you every step of the way. If you have any questions or concerns, please don't hesitate to ask our healthcare team.`;
  }

  private static getMockSimplifiedNotes(clinicalNotes: string): string {
    return `Based on your examination: ${clinicalNotes}. In simple terms, this means we need to monitor your condition and follow up as recommended. Our medical team will explain everything in detail during your next visit.`;
  }

  private static getMockCarePlan(
    condition: string,
    patientAge: string,
    mobilityLevel: string
  ): string {
    return `Your Personalized Care Plan for ${condition}:\n\n1. **Daily Monitoring**: Check your symptoms each morning\n2. **Medication**: Take prescribed medications as directed\n3. **Activity**: ${
      mobilityLevel === "limited"
        ? "Gentle exercises as tolerated"
        : "Regular physical activity as recommended"
    }\n4. **Nutrition**: Follow dietary guidelines provided\n5. **Follow-up**: Attend all scheduled appointments\n6. **Emergency**: Know when to seek immediate care\n\nRemember, this plan is tailored to your needs as a ${patientAge}-year-old patient. We'll adjust it as needed based on your progress.`;
  }

  static async generateClinicalDocumentation(
    encounterData: any
  ): Promise<string> {
    await initializeLlama();

    if (llamaPipeline.isMock) {
      return this.getMockClinicalDocumentation(encounterData);
    }

    const prompt = `Generate structured clinical documentation for this encounter: ${JSON.stringify(
      encounterData
    )}. Include assessment, plan, and recommendations in standard medical format.`;

    try {
      const result = await llamaPipeline(prompt, {
        max_new_tokens: 400,
        temperature: 0.5,
        do_sample: true,
      });

      return result[0]?.generated_text || "Documentation generation failed";
    } catch (error) {
      console.error("Documentation generation error:", error);
      return this.getMockClinicalDocumentation(encounterData);
    }
  }

  static async generateDischargeSummary(encounters: any[]): Promise<string> {
    await initializeLlama();

    if (llamaPipeline.isMock) {
      return this.getMockDischargeSummary(encounters);
    }

    const prompt = `Generate a comprehensive discharge summary based on these encounters: ${JSON.stringify(
      encounters
    )}. Include admission diagnosis, procedures, medications, and follow-up instructions.`;

    try {
      const result = await llamaPipeline(prompt, {
        max_new_tokens: 500,
        temperature: 0.4,
        do_sample: true,
      });

      return result[0]?.generated_text || "Discharge summary generation failed";
    } catch (error) {
      console.error("Discharge summary error:", error);
      return this.getMockDischargeSummary(encounters);
    }
  }

  static async simplifyPrescriptionInstructions(
    prescription: string,
    patientAge: string,
    patientLiteracy: string
  ): Promise<string> {
    await initializeLlama();

    if (llamaPipeline.isMock) {
      return this.getMockSimplifiedPrescription(
        prescription,
        patientAge,
        patientLiteracy
      );
    }

    const prompt = `Simplify these prescription instructions for a ${patientAge}-year-old patient with ${patientLiteracy} literacy level: ${prescription}. Use simple language and clear timing.`;

    try {
      const result = await llamaPipeline(prompt, {
        max_new_tokens: 200,
        temperature: 0.6,
        do_sample: true,
      });

      return result[0]?.generated_text || prescription;
    } catch (error) {
      console.error("Prescription simplification error:", error);
      return this.getMockSimplifiedPrescription(
        prescription,
        patientAge,
        patientLiteracy
      );
    }
  }

  private static getMockClinicalDocumentation(encounterData: any): string {
    return `CLINICAL DOCUMENTATION\n\nDATE: ${new Date().toLocaleDateString()}\nENCOUNTER TYPE: ${
      encounterData.encounterType
    }\n\nASSESSMENT:\nPatient presents with ${
      encounterData.symptoms || "reported symptoms"
    }. Examination reveals ${
      encounterData.examination || "clinical findings"
    }. \n\nDIAGNOSIS:\n${
      encounterData.diagnosis || "Condition under evaluation"
    }\n\nPLAN:\n${
      encounterData.treatment || "Treatment plan initiated"
    }\n\nNOTES:\n${
      encounterData.notes || "Patient counseled on condition and treatment."
    }\n\n--- Generated by Q Healthcare AI Assistant ---`;
  }

  private static getMockDischargeSummary(encounters: any[]): string {
    const latestEncounter = encounters[0] || {};
    return `DISCHARGE SUMMARY\n\nPATIENT: [Patient Name]\nADMISSION DATE: ${new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toLocaleDateString()}\nDISCHARGE DATE: ${new Date().toLocaleDateString()}\n\nADMITTING DIAGNOSIS:\n${
      latestEncounter.diagnosis || "Medical condition"
    }\n\nHOSPITAL COURSE:\nPatient was admitted for evaluation and management. Underwent diagnostic studies and received appropriate treatment.\n\nPROCEDURES:\n- Clinical evaluation and monitoring\n- Medication management\n- Patient education\n\nDISCHARGE MEDICATIONS:\n[Medications as prescribed during hospitalization]\n\nDISCHARGE INSTRUCTIONS:\n1. Take all medications as prescribed\n2. Follow up with primary care provider in 1 week\n3. Monitor for any concerning symptoms\n4. Contact healthcare provider if condition worsens\n\nFOLLOW-UP:\n- Primary care: 1 week\n- Specialist: As needed\n- Emergency: Seek immediate care for severe symptoms\n\n--- Generated by Q Healthcare AI Assistant ---`;
  }

  private static getMockSimplifiedPrescription(
    prescription: string,
    patientAge: string,
    patientLiteracy: string
  ): string {
    return `SIMPLIFIED MEDICATION INSTRUCTIONS\n\n${prescription}\n\nEASY TO UNDERSTAND:\n• Take your medicine exactly as your doctor told you\n• Take it at the same time every day\n• Don't skip doses\n• If you forget a dose, take it as soon as you remember\n• Don't take two doses at the same time\n• Keep taking your medicine until your doctor says to stop\n\nIf you have questions about your medicine, ask your doctor or pharmacist.\n\n--- Generated by Q Healthcare AI Assistant ---`;
  }
}
