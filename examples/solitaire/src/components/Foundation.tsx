//Foundation.tsx
import React from 'react';

import Image from 'next/image';
import { Draggable, Droppable } from 'react-beautiful-dnd';

import Card from './Card';
import { getStyle } from './Tableau';

import { CardProps } from '~/SolitairePuzzle';

interface FoundationProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  suits: any[];
  suitCards: CardProps[][]; 
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
              className="relative w-[12vw] h-[18vw] md:w-[80px] md:h-[120px] flex justify-center items-center bg-[#4b0000] border-[#7f1d1d80] border-[1vw] md:border-8 md:rounded-md rounded">
              <div className="text-red-900 opacity-50 text-[10vw] md:text-[4rem] absolute">
                <Image width={ 50 } height={ 50 } className='p-2' style={ { filter: 'invert(21%) sepia(100%) saturate(7414%) hue-rotate(359deg) brightness(50%) contrast(117%)' } } src={ pile } alt={ pile }></Image>
              </div>
              {suitCards[index].map((card, cardIndex) => {
                if (!card) { 
                  return null;
                }
                return (
                  <Draggable
                    draggableId={ `${card.id}` }
                    index={ cardIndex }
                    key={ `${card.id}` }>
                    {(provided, snapshot) => (
                      <div
                        className='absolute'
                        ref={ provided.innerRef }
                        { ...provided.draggableProps }
                        { ...provided.dragHandleProps }
                        style={ getStyle( provided.draggableProps.style, snapshot) }>
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
