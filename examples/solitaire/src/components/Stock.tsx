// Stock.tsx
import React from 'react';

import { Draggable, Droppable } from 'react-beautiful-dnd';

import Card from './Card';

import { CardProps } from '~/SolitairePuzzle';

interface StockProps {
  cards: CardProps[];
  wasteCards: CardProps[]; 
  onDrawCard: () => void;
}

const Stock: React.FC<StockProps> = ({
  cards = [], 
  wasteCards = [], 
  onDrawCard,
}) => {

  return (
    <React.Fragment>
      <div className='relative flex py-2 gap-3 w-fit'>
        <div 
          onClick={ onDrawCard }
          className="relative w-[12vw] h-[18vw] md:w-[80px] md:h-[120px] mb-5 border-red-900 border-2 border-dashed cursor-pointer rounded">
          {cards.map((card, cardIndex) => (
            <div
              key={ cardIndex } 
              style={ {
                position: 'absolute', 
                top: `${cardIndex * 0.02}rem`, 
              } }>
              <Card 
                key={ cardIndex } 
                { ...card } 
                isFaceUp={ false } />
            </div>
          ))}
        </div>
        {/* Waste pile */}
        <Droppable droppableId="waste" isDropDisabled={ true }>
          {(provided) => (
            <div
              { ...provided.droppableProps }
              ref={ provided.innerRef }
              className="relative w-[12vw] h-[18vw] md:w-[80px] md:h-[120px] mb-5">
              {wasteCards.map((card, cardIndex) => {
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
                        style={ {
                          position: 'absolute',
                          top: `${cardIndex * 0.02}rem`, 
                          ...provided.draggableProps.style, 
                        } }>
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
      </div>
    </React.Fragment>
  );
};

export default Stock;
