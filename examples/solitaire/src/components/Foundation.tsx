//Foundation.tsx
import React from 'react';

import { Draggable, Droppable } from 'react-beautiful-dnd';

import Card from './Card';

import { CardType } from '~/SolitairePuzzle';

interface FoundationProps {
  suits: string[];
  suitCards: CardType[][]; 
  setsuitCards: React.Dispatch<React.SetStateAction<CardType[][]>>;

}

const Foundation: React.FC<FoundationProps> = ({ suits, suitCards }) => {
  return (
    <div className="flex justify-between gap-3 py-4">
      {suits.map((pile, index) => (
        <Droppable droppableId={ `suit-${index}` } key={ index }>
          {(provided) => (
            <div
              { ...provided.droppableProps }
              ref={ provided.innerRef }
              className="relative w-[12vw] h-[18vw] lg:w-[80px] lg:h-[120px] flex justify-center items-center bg-[#4b0000] border-[#7f1d1d80] border-[1vw] lg:border-8 lg:rounded-md rounded">
              <div className="text-red-900 opacity-50 text-[10vw] lg:text-[4rem] absolute">{pile}</div>
              {suitCards[index].map((card, cardIndex) => {
                if (!card) { 
                  return null;
                }
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
                        style={ { position: 'absolute', ...provided.draggableProps.style } }>
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

export default Foundation;
