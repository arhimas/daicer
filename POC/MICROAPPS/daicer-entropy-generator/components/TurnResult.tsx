import React from 'react';

interface TurnResultProps {
  message: string;
}

const TurnResult: React.FC<TurnResultProps> = ({ message }) => {
  const getDisplayConfig = () => {
    if (message.startsWith('[Mutation]')) {
      return {
        icon: '🔄',
        bgColor: 'bg-blue-900/50',
        borderColor: 'border-blue-500/50',
        textColor: 'text-blue-200',
      };
    }
    if (message.startsWith('[Event]')) {
      return {
        icon: '⚡️',
        bgColor: 'bg-amber-900/50',
        borderColor: 'border-amber-500/50',
        textColor: 'text-amber-200',
      };
    }
    if (message.startsWith('A new world')) {
       return {
        icon: '✨',
        bgColor: 'bg-purple-900/50',
        borderColor: 'border-purple-500/50',
        textColor: 'text-purple-200',
      };
    }
    // Default for "The world remains stable..."
    return {
      icon: '🛡️',
      bgColor: 'bg-gray-700/50',
      borderColor: 'border-gray-500/50',
      textColor: 'text-gray-300',
    };
  };

  const { icon, bgColor, borderColor, textColor } = getDisplayConfig();

  return (
    <div
      className={`max-w-3xl mx-auto my-6 p-4 rounded-lg border transition-all duration-500 ease-in-out ${bgColor} ${borderColor} ${textColor}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center">
        <span className="text-2xl mr-3" aria-hidden="true">{icon}</span>
        <p className="font-semibold">{message}</p>
      </div>
    </div>
  );
};

export default TurnResult;
