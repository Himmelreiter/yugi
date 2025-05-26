import Image from 'next/image';

interface CardTypeIconProps {
  type: string;
  className?: string;
}

const CardTypeIcon = ({ type, className = '' }: CardTypeIconProps) => {
  const getIconPath = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'Ritual': '/icons/card-types/Ritual.webp',
      'Quick-Play': '/icons/card-types/Quick-Play.webp',
      'Continuous': '/icons/card-types/Continuous.webp',
      'Equip': '/icons/card-types/Equip.webp',
      'Field': '/icons/card-types/Field.webp',
      'Counter': '/icons/card-types/Counter.webp',
    };

    return typeMap[type] || '/icons/card-types/Normal.webp';
  };

  return (
    <div className={`relative ${className}`}>
      <Image
        src={getIconPath(type)}
        alt={`${type} icon`}
        width={24}
        height={24}
        className="object-contain"
      />
    </div>
  );
};

export default CardTypeIcon; 