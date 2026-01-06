
import React from 'react';
import { ExclamationTriangleIcon } from './Icons';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="bg-red-900/50 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg relative max-w-3xl mx-auto" role="alert">
      <div className="flex items-center">
        <div className="py-1">
          <ExclamationTriangleIcon />
        </div>
        <div>
          <p className="font-bold ml-3">An Error Occurred</p>
          <p className="text-sm ml-3">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
