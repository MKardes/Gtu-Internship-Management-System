// ErrorAlert.tsx
import React from "react";
import { Alert } from "react-bootstrap";

interface ErrorAlertProps {
  show: boolean;
  onClose: () => void;
  message: string;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ show, onClose, message }) => {
  if (!show) return null;

  return (
    <Alert className="mb-2" variant="danger" onClose={onClose} dismissible>
      {message}
    </Alert>
  );
};

export default ErrorAlert;
