/**
 * Composant Card - Conteneur de contenu avec ombre et bordures
 */
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card = ({ children, className = '' }: CardProps) => (
  <div className={`bg-white rounded-lg shadow-md p-6 border border-gray-100 ${className}`}>
    {children}
  </div>
);
