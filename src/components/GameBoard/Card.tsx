interface CardProps {
  value: string | number;
  type: 'number' | 'operator';
  isSelected?: boolean;
  onClick?: () => void;
}

export default function Card({ value, type, isSelected = false, onClick }: CardProps) {
  const cardClass = `
    card 
    ${type === 'number' ? 'bg-white' : 'bg-yellow-200'} 
    ${isSelected ? 'border-2 border-blue-500' : 'border border-gray-300'}
    rounded-lg shadow-md p-4 w-16 h-24 flex items-center justify-center cursor-pointer
  `;

  return (
    <div className={cardClass} onClick={onClick}>
      <span className="text-2xl font-bold">{value}</span>
    </div>
  );
} 