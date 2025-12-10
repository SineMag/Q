import { useState } from "react";
import { aiApi } from "../services/api";

interface AIExplanationProps {
  onExplanation?: (explanation: string) => void;
}

export default function AIExplanation({ onExplanation }: AIExplanationProps) {
  const [condition, setCondition] = useState("");
  const [treatment, setTreatment] = useState("");
  const [nextSteps, setNextSteps] = useState("");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateExplanation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!condition.trim() || !treatment.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await aiApi.generateExplanation(
        condition,
        treatment,
        nextSteps
      );
      setExplanation(response.explanation);
      onExplanation?.(response.explanation);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to generate explanation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-explanation">
      <h3>Patient Explanation Generator</h3>
      <p>
        Create clear, empathetic explanations for patients about their condition
        and treatment
      </p>

      <form onSubmit={handleGenerateExplanation} className="explanation-form">
        <div className="form-group">
          <label htmlFor="condition">Condition/Diagnosis *</label>
          <input
            id="condition"
            type="text"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            placeholder="e.g., Hypertension, Diabetes, Pneumonia"
            className="input"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="treatment">Treatment Plan *</label>
          <textarea
            id="treatment"
            value={treatment}
            onChange={(e) => setTreatment(e.target.value)}
            placeholder="Describe the treatment approach, medications, procedures..."
            rows={3}
            className="input"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="next-steps">Next Steps</label>
          <textarea
            id="next-steps"
            value={nextSteps}
            onChange={(e) => setNextSteps(e.target.value)}
            placeholder="What the patient should do next - follow-up appointments, monitoring, etc."
            rows={2}
            className="input"
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !condition.trim() || !treatment.trim()}
        >
          {loading ? "Generating..." : "Generate Patient Explanation"}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {explanation && (
        <div className="explanation-result">
          <h4>Patient-Friendly Explanation:</h4>
          <div className="explanation-text">{explanation}</div>
          <div className="explanation-actions">
            <button
              className="btn btn-secondary"
              onClick={() => navigator.clipboard.writeText(explanation)}
            >
              Copy Explanation
            </button>
          </div>
        </div>
      )}

      <style>{`
        .ai-explanation {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        
        .explanation-form {
          margin: 15px 0;
        }
        
        .explanation-result {
          margin-top: 20px;
          padding: 15px;
          background: #e3f2fd;
          border-radius: 6px;
          border-left: 4px solid #2196F3;
        }
        
        .explanation-text {
          line-height: 1.6;
          white-space: pre-wrap;
          margin: 10px 0;
        }
        
        .explanation-actions {
          margin-top: 15px;
        }
      `}</style>
    </div>
  );
}
