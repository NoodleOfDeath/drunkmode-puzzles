import React from 'react';

import Image from 'next/image';

import AppIcon from './../assets/AppIcon.png';
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
      className={ `font-bold border lg:rounded-md rounded overflow-hidden w-[12vw] h-[18vw] lg:w-[80px] lg:h-[120px] bg-white ${red ? 'text-red-700' : 'text-black'}` }>
      {isFaceUp ? (
        <React.Fragment>
          <div className="p-[1vw] lg:p-2 flex justify-between items-baseline">
            <div className="text-[4.5vw] lg:text-[2rem] leading-[0.5]">{rank}</div>
            <div className="text-[5vw] lg:text-[2rem] leading-[0.5]">{suit}</div>
          </div>
          <div className="text-[10vw] lg:text-[5rem] w-full text-center  leading-[0.8]">{suit}</div>
        </React.Fragment>
      ) : <div className="p-[1vw] lg:p-2 h-full w-full flex justify-center items-center bg-[#4a7ecf] border-white border-[0.5vw] lg:rounded-md rounded"><Image src={ AppIcon } alt='Drunk mode App Icon'></Image></div>}
    </div>
  );
};

export default Card;
