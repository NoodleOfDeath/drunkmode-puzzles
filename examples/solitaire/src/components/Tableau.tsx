//Tableau.tsx
import React from 'react';

import dynamic from 'next/dynamic';
import {
  DragDropContext,
  Draggable,
  Droppable,
} from 'react-beautiful-dnd';

import Card from './Card';

import { CardType } from '~/SolitairePuzzle';

interface TableauProps {
  cards: CardType[]
}

const Tableau: React.FC<TableauProps> = ({ cards }) => {
  const tableauCards: Array<Array<CardType>> = [];
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
    <DragDropContext onDragEnd={ () => console.log('ends') }>
      <div className="grid w-full grid-cols-7 justify-items-center">
        {tableauCards.map((column, columnIndex) => (
          <Droppable droppableId={ `col-${columnIndex}` } key={ columnIndex }>
            {(provided) => (
              <div { ...provided.droppableProps } ref={ provided.innerRef } style={ { height: `${(column.length - 1) * 20 + 150}px` } }>
                {column.map((card, cardIndex) => {
                  const isLastCard = cardIndex === column.length - 1;
                  return (
                    <Draggable draggableId={ `${cardIndex}` } index={ cardIndex } key={ cardIndex }>
                      {(provided) => (
                        <div
                          ref={ provided.innerRef }
                          { ...provided.draggableProps }
                          style={ { transform: `translateY(${cardIndex * -75}%)` } }>
                          <Card { ...card } isFaceUp={ isLastCard } />
                        </div>
                      )}
                    </Draggable>
                  );
                })} 
              </div>
            )}
            
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
};

export default Tableau;
