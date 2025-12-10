import { useState } from "react";
import { aiApi } from "../services/api";

interface AITranslatorProps {
  onTranslation?: (translatedText: string) => void;
}

export default function AITranslator({ onTranslation }: AITranslatorProps) {
  const [medicalText, setMedicalText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranslate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicalText.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await aiApi.translateMedicalText(medicalText);
      setTranslatedText(response.translatedText);
      onTranslation?.(response.translatedText);
    } catch (err: any) {
      setError(err.response?.data?.error || "Translation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-translator">
      <h3>Medical Terminology Translator</h3>
      <p>Convert complex medical terms into patient-friendly language</p>

      <form onSubmit={handleTranslate} className="translator-form">
        <div className="form-group">
          <label htmlFor="medical-text">Medical Text or Terminology</label>
          <textarea
            id="medical-text"
            value={medicalText}
            onChange={(e) => setMedicalText(e.target.value)}
            placeholder="Enter medical terms, diagnosis, or clinical notes..."
            rows={4}
            className="input"
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !medicalText.trim()}
        >
          {loading
            ? "Translating..."
            : "Translate to Patient-Friendly Language"}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {translatedText && (
        <div className="translation-result">
          <h4>Patient-Friendly Translation:</h4>
          <div className="translated-text">{translatedText}</div>
        </div>
      )}

      <style>{`
        .ai-translator {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }

        .translator-form {
          margin: 15px 0;
        }

        .translation-result {
          margin-top: 20px;
          padding: 15px;
          background: #e8f5e8;
          border-radius: 6px;
          border-left: 4px solid #4caf50;
        }

        .translated-text {
          line-height: 1.6;
          white-space: pre-wrap;
        }
      `}</style>
    </div>
  );
}
