import { useState } from "react";
import AITranslator from "../components/AITranslator";
import AIExplanation from "../components/AIExplanation";
import { aiApi } from "../services/api";

export default function HealthcareCommunication() {
  const [activeTab, setActiveTab] = useState<
    "translator" | "explanation" | "careplan"
  >("translator");
  const [carePlan, setCarePlan] = useState("");
  const [carePlanLoading, setCarePlanLoading] = useState(false);
  const [carePlanError, setCarePlanError] = useState<string | null>(null);

  const [carePlanData, setCarePlanData] = useState({
    condition: "",
    patientAge: "",
    mobilityLevel: "normal",
  });

  const handleGenerateCarePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!carePlanData.condition.trim()) return;

    setCarePlanLoading(true);
    setCarePlanError(null);

    try {
      const response = await aiApi.generateCarePlan(
        carePlanData.condition,
        carePlanData.patientAge,
        carePlanData.mobilityLevel
      );
      setCarePlan(response.carePlan);
    } catch (err: any) {
      setCarePlanError(
        err.response?.data?.error || "Failed to generate care plan"
      );
    } finally {
      setCarePlanLoading(false);
    }
  };

  return (
    <div className="healthcare-communication">
      <div className="page-header">
        <h1>AI-Powered Healthcare Communication</h1>
        <p>
          Bridging the gap between clinical expertise and patient understanding
        </p>
      </div>

      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === "translator" ? "active" : ""}`}
          onClick={() => setActiveTab("translator")}
        >
          Medical Translator
        </button>
        <button
          className={`tab-btn ${activeTab === "explanation" ? "active" : ""}`}
          onClick={() => setActiveTab("explanation")}
        >
          Patient Explanation
        </button>
        <button
          className={`tab-btn ${activeTab === "careplan" ? "active" : ""}`}
          onClick={() => setActiveTab("careplan")}
        >
          Care Plan Generator
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "translator" && <AITranslator />}

        {activeTab === "explanation" && <AIExplanation />}

        {activeTab === "careplan" && (
          <div className="care-plan-generator">
            <h3>Personalized Care Plan Generator</h3>
            <p>
              Create tailored care plans based on patient condition and needs
            </p>

            <form onSubmit={handleGenerateCarePlan} className="care-plan-form">
              <div className="form-group">
                <label htmlFor="care-condition">Condition *</label>
                <input
                  id="care-condition"
                  type="text"
                  value={carePlanData.condition}
                  onChange={(e) =>
                    setCarePlanData({
                      ...carePlanData,
                      condition: e.target.value,
                    })
                  }
                  placeholder="e.g., Post-surgery recovery, Chronic condition management"
                  className="input"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="patient-age">Patient Age</label>
                  <input
                    id="patient-age"
                    type="text"
                    value={carePlanData.patientAge}
                    onChange={(e) =>
                      setCarePlanData({
                        ...carePlanData,
                        patientAge: e.target.value,
                      })
                    }
                    placeholder="e.g., 45 years, elderly, pediatric"
                    className="input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="mobility">Mobility Level</label>
                  <select
                    id="mobility"
                    value={carePlanData.mobilityLevel}
                    onChange={(e) =>
                      setCarePlanData({
                        ...carePlanData,
                        mobilityLevel: e.target.value,
                      })
                    }
                    className="select"
                  >
                    <option value="normal">Normal Mobility</option>
                    <option value="limited">Limited Mobility</option>
                    <option value="restricted">Restricted Mobility</option>
                    <option value="bedridden">Bedridden</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={carePlanLoading || !carePlanData.condition.trim()}
              >
                {carePlanLoading ? "Generating..." : "Generate Care Plan"}
              </button>
            </form>

            {carePlanError && (
              <div className="error-message">{carePlanError}</div>
            )}

            {carePlan && (
              <div className="care-plan-result">
                <h4>Personalized Care Plan:</h4>
                <div className="care-plan-text">{carePlan}</div>
                <div className="care-plan-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => navigator.clipboard.writeText(carePlan)}
                  >
                    Copy Care Plan
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => window.print()}
                  >
                    Print Care Plan
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .healthcare-communication {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .page-header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .tab-navigation {
          display: flex;
          gap: 10px;
          margin-bottom: 30px;
          border-bottom: 2px solid #e0e0e0;
        }
        
        .tab-btn {
          padding: 12px 24px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          font-weight: 500;
          color: #666;
          border-bottom: 3px solid transparent;
          transition: all 0.3s ease;
        }
        
        .tab-btn.active {
          color: #4A90A4;
          border-bottom-color: #4A90A4;
        }
        
        .tab-content {
          min-height: 400px;
        }
        
        .care-plan-generator {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
        }
        
        .care-plan-form {
          margin: 15px 0;
        }
        
        .form-row {
          display: flex;
          gap: 20px;
        }
        
        .form-row .form-group {
          flex: 1;
        }
        
        .care-plan-result {
          margin-top: 20px;
          padding: 20px;
          background: #f3e5f5;
          border-radius: 6px;
          border-left: 4px solid #9C27B0;
        }
        
        .care-plan-text {
          line-height: 1.6;
          white-space: pre-wrap;
          margin: 15px 0;
        }
        
        .care-plan-actions {
          display: flex;
          gap: 10px;
          margin-top: 15px;
        }
      `}</style>
    </div>
  );
}
