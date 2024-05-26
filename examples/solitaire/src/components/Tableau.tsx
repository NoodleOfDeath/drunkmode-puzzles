//Tableau.tsx
import React from 'react';

import {
  Draggable,
  DraggableStateSnapshot,
  DraggingStyle,
  Droppable,
  NotDraggingStyle,
} from 'react-beautiful-dnd';

import Card from './Card';

import { CardProps } from '~/SolitairePuzzle';

interface TableauProps {
  tableauCards: CardProps[][];
}

// stop reordering animation 
export function getStyle(style: DraggingStyle | NotDraggingStyle | undefined, snapshot: DraggableStateSnapshot) {
  if (!snapshot.isDragging) {
    return {};
  }
  if (!snapshot.isDropAnimating) {
    return style;
  }

  return {
    ...style,
    // cannot be 0, but make it super tiny
    transitionDuration: '0.001s',
  };
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
              style={ { gridTemplateRows: `repeat(${(column.length )}, clamp(15px, 5vw, 35px))`, minHeight: `${(column.length - 1) * 20 + 150}px` } }>
              {column.map((card, cardIndex) => {
                if (!card) { 
                  return null;
                }
                return (
                  <Draggable
                    isDragDisabled={ !card.isFaceUp }
                    draggableId={ `${card.id}` }
                    index={ cardIndex }
                    key={ `${card.id}` }>
                    {(provided, snapshot) => (
                      <div
                        ref={ provided.innerRef }
                        { ...provided.draggableProps }
                        { ...provided.dragHandleProps }
                        style={ getStyle( provided.draggableProps.style, snapshot) }>
                        <Card { ...card } />
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
