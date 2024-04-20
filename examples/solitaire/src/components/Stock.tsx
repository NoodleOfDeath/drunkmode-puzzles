import React, { useEffect, useState } from 'react';

import Card from './Card';

import { CardType } from '~/SolitairePuzzle';

interface StockProps {
  cards: CardType[];
}

const Stock: React.FC<StockProps> = ({ cards }) => {
  const [wasteCards, setWasteCards] = useState<CardType[]>([]);

  const [Cards, setCards] = useState<CardType[]>([]);

  useEffect(() => {
    setCards(cards);
  }, [cards]);
  
  const handleDrawCard = () => {
    if (Cards.length > 0) {
      const lastCard = Cards[Cards.length - 1]; 
      lastCard.isFaceUp = true;
      setWasteCards([...wasteCards, lastCard]);
      setCards(Cards.slice(0, -1)); 
    } else {
      const resetWasteCards = wasteCards.map(card => ({ ...card, isFaceUp: false }));
      setCards(resetWasteCards); 
      setWasteCards([]); 
    }
  };

  return (
    <React.Fragment>
      <div className='flex py-2 gap-3 w-fit'>
        <div onClick={ handleDrawCard } className="relative w-[12vw] h-[18vw] lg:w-[80px] lg:h-[120px] mb-5">
          {Cards.map((card, cardIndex) => (
            <div key={ cardIndex } style={ { position: 'absolute', top: `${cardIndex * 0.02}rem` } }>
              <Card key={ cardIndex } { ...card } isFaceUp={ false } />
            </div>
          ))}
        </div>
        {/* Waste pile */}
        <div className="relative w-[12vw] h-[18vw] lg:w-[80px] lg:h-[120px] mb-5">
          {wasteCards.map((card, cardIndex) => (
            <div key={ cardIndex } style={ { position: 'absolute', top: `${cardIndex * 0.02}rem` } }>
              <Card key={ cardIndex } { ...card } isFaceUp={ true } />
            </div>
          ))}
        </div>
      </div>
    </React.Fragment>
  );
};

export default Stock;

