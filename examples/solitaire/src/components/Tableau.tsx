//Tableau.tsx
import React from 'react';

import dynamic from 'next/dynamic';

import Card from './Card';

import { CardType } from '~/SolitairePuzzle';

const DragDropContext = dynamic(
  () =>
    import('react-beautiful-dnd').then(mod => {
      return mod.DragDropContext;
    }),
  { ssr: false }
);
const Droppable = dynamic(
  () =>
    import('react-beautiful-dnd').then(mod => {
      return mod.Droppable;
    }),
  { ssr: false }
);
const Draggable = dynamic(
  () =>
    import('react-beautiful-dnd').then(mod => {
      return mod.Draggable;
    }),
  { ssr: false }
);

interface TableauProps {
  cards: CardType[]
}

const Tableau: React.FC<TableauProps> = ({ cards }) => {

  const tableauCards = React.useMemo(() => {
    const _cards: CardType[][] = [];
    let currentIndex = 0;
    for (let i = 1; i <= 7; i++) {
      const column = [];
      for (let j = 0; j < i; j++) {
        column.push(cards[currentIndex + j]);
      }
      _cards.push(column);
      currentIndex += i;
    }
    return _cards;
  }, [cards]);

  return (
    <DragDropContext onDragEnd={ () => console.log('ends') }>
      <div className="grid w-full grid-cols-7 justify-items-center">
        {tableauCards.map((column, columnIndex) => (
          <Droppable droppableId={ `col-${columnIndex}` } key={ `col-${columnIndex}` }>
            {(provided) => (
              <div
                { ...provided.droppableProps }
                ref={ provided.innerRef }
                style={ { height: `${(column.length - 1) * 20 + 150}px` } }>
                {column.map((card, cardIndex) => {
                  if (!card) { 
                    return null;
                  }
                  const isLastCard = cardIndex === column.length - 1;
                  return (
                    <Draggable
                      draggableId={ `${card.rank}${card.suit}` }
                      index={ cardIndex }
                      key={ `${card.rank}${card.suit}` }>
                      {(provided) => (
                        <div
                          ref={ provided.innerRef }
                          { ...provided.draggableProps }
                          { ...provided.dragHandleProps }
                          style={ { transform: `translateY(${cardIndex * -75}%)` } }>
                          <Card { ...card } isFaceUp={ isLastCard } />
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
};

export default Tableau;
