/**
 * Composant Toast - Notification temporaire
 */
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
}

export const Toast = ({ message, type }: ToastProps) => {
  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div className={`${bgColor[type]} text-white px-4 py-3 rounded-lg shadow-lg`}>
      {message}
    </div>
  );
};
