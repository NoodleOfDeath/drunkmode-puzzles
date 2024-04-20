import React from 'react';

import Card from './Card';

interface StockProps {
  cards: Array<{
    suit: string;
    rank: string;
    isFaceUp: boolean;
    red: boolean;
  }>;
}

const Stock: React.FC<StockProps> = ({ cards }) => {
  
  return (
    <React.Fragment>
      <div className='flex py-2 gap-3 w-fit'>
        <div className="relative w-[12vw] h-[18vw] lg:w-[80px] lg:h-[120px] mb-5">
          {cards.map((card, cardIndex) => (
            <div key={ cardIndex } style={ { position: 'absolute', top: `${cardIndex * 0.02}rem` } }>
              <Card key={ cardIndex } { ...card } isFaceUp={ false } />
            </div>
          ))}
        </div>
        {/* waste */}
        <div className="waste relative w-[12vw] h-[18vw] lg:w-[80px] lg:h-[120px] mb-5"></div>
      </div>
    </React.Fragment>
  );
};

export default Stock;