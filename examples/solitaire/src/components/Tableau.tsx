//Tableau.tsx
import React from 'react';

import { Draggable, Droppable } from 'react-beautiful-dnd';

import Card from './Card';

import { CardType } from '~/SolitairePuzzle';

interface TableauProps {
  tableauCards: CardType[][]
}

const Tableau: React.FC<TableauProps> = ({ tableauCards }) => {
  
  return (
    
    <div className="grid w-full grid-cols-7 justify-items-center flex-1">
      {tableauCards.map((column, columnIndex) => (
        <Droppable droppableId={ `col-${columnIndex}` } key={ `col-${columnIndex}` }>
          {(provided) => (
            <div
              { ...provided.droppableProps }
              ref={ provided.innerRef }
              className='grid justify-items-center flex-1 min-w-full'
              style={ { gridTemplateRows: `repeat(${(column.length )}, clamp(15px, 5vw, 45px))`, minHeight: `${(column.length - 1) * 20 + 150}px` } }>
              {column.map((card, cardIndex) => {
                if (!card) { 
                  return null;
                }
                //const isLastCard = cardIndex === column.length - 1;
                return (
                  <Draggable
                    draggableId={ `${card.id}` }
                    index={ cardIndex }
                    key={ `${card.id}` }>
                    {(provided) => (
                      <div
                        ref={ provided.innerRef }
                        { ...provided.draggableProps }
                        { ...provided.dragHandleProps }
                        style={ { ...provided.draggableProps.style } }>
                        <Card { ...card } isFaceUp={ true } />
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
    
  );
};

export default Tableau;
