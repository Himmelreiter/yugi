import React from 'react';
import Image from 'next/image';

interface AttributeIconProps {
  attribute: string;
  className?: string;
}

const AttributeIcon = ({ attribute, className = '' }: AttributeIconProps) => {
  const getIconPath = (attribute: string) => {
    const attributeMap: { [key: string]: string } = {
      'DARK': '/icons/card-types/DARK.svg',
      'LIGHT': '/icons/card-types/LIGHT.svg',
      'WATER': '/icons/card-types/WATER.svg',
      'FIRE': '/icons/card-types/FIRE.svg',
      'EARTH': '/icons/card-types/EARTH.svg',
      'WIND': '/icons/card-types/WIND.svg',
      'DIVINE': '/icons/card-types/DIVINE.svg',
      'LEVEL': '/icons/card-types/Level.webp'
    };

    return attributeMap[attribute] || '/icons/card-types/DARK.svg';
  };

  return (
    <div className={`relative ${className}`}>
      <Image
        src={getIconPath(attribute)}
        alt={`${attribute} icon`}
        width={24}
        height={24}
        className="object-contain"
      />
    </div>
  );
};

export default AttributeIcon; 