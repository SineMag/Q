import "./Snackbar.css";

interface SnackbarProps {
  isOpen: boolean;
  message: string;
  type?: "success" | "error" | "warning" | "info";
}

export default function Snackbar({
  isOpen,
  message,
  type = "success",
}: SnackbarProps) {
  if (!isOpen) return null;

  return (
    <div className={`snackbar snackbar-${type}`}>
      <div className="snackbar-content">
        <div className="snackbar-icon">
          {type === "success" && (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 12l2 2 4-4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          )}
          {type === "error" && (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          )}
          {type === "warning" && (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 9v4m0 4h.01M5.07 19h13.86a2 2 0 001.67-3.09l-6.93-11.8a2 2 0 00-3.46 0l-6.93 11.8A2 2 0 005.07 19z"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          )}
          {type === "info" && (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M12 16v-4m0-4h.01"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </div>
        <span className="snackbar-message">{message}</span>
      </div>
    </div>
  );
}
