import React from 'react';

import Card from './Card';

interface TableauProps {
  cards: Array<{
    suit: string;
    rank: string;
    isFaceUp: boolean;
    red: boolean;
  }>;
}

const Tableau: React.FC<TableauProps> = ({ cards }) => {
  const tableauCards = [];
  let currentIndex = 0;
  for (let i = 1; i <= 7; i++) {
    const column = [];
    for (let j = 0; j < i; j++) {
      column.push(cards[currentIndex + j]);
    }
    tableauCards.push(column);
    currentIndex += i;
  }
  return (
    
    <div className="grid w-full grid-cols-7 justify-items-center">
      {tableauCards.map((column, columnIndex) => (
        <div className="tableau-column" key={ columnIndex }>
          {column.map((card, cardIndex) => (
            <Card key={ cardIndex } { ...card } />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Tableau;
