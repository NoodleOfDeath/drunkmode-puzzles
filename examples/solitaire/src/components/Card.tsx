//Card.tsx
import React from 'react';

import Image from 'next/image';

import AppIcon from '~/assets/AppIcon.png';
interface CardProps {
  id: string;
  suit: string;
  rank: string;
  isFaceUp: boolean;
  red: boolean;
}

const Card: React.FC<CardProps> = ({
  suit, rank, isFaceUp, red,
}) => {

  return (
    <div
      className={ `font-bold border md:rounded-md rounded overflow-hidden w-[12vw] h-[18vw] md:w-[80px] md:h-[120px] bg-white ${red ? 'text-red-700' : 'text-black'}` }>
      {isFaceUp ? (
        <React.Fragment>
          <div className="p-[0.9vw] h-1/3 md:p-2 flex justify-between items-center">
            <div className="text-[4.5vw] md:text-[2rem] leading-[0.5]">{rank}</div>
            <div className="w-[4vw] md:w-[2rem]">
              <Image className="py-[0.9vw] max-h-full w-auto" src={ suit } alt={ suit }></Image>
            </div>
          </div>
          <div className="w-full h-2/3 flex items-center md:w-[5rem] justify-center">
            <Image className="h-full w-auto p-2" src={ suit } alt={ suit }></Image>
          </div>
        </React.Fragment>
      ) : <div className="p-[1vw] md:p-2 h-full w-full flex justify-center items-center bg-[#4a7ecf] border-white border-[0.5vw] md:rounded-md rounded"><Image src={ AppIcon } alt='Drunk mode App Icon'></Image></div>}
    </div>
  );
};

export default Card;
