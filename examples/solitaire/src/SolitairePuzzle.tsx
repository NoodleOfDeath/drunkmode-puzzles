import React, { useEffect, useState } from 'react';

import { PuzzleProps } from 'drunkmode-puzzles';

import Foundation from './components/Foundation';
import StockPile from './components/Stock';
import Tableau from './components/Tableau';

// Define card suits and ranks
const suits = ['♠', '♣', '♥', '♦'];
const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// Generate all 52 cards
const cards: { isFaceUp: boolean; rank: string; red: boolean; suit: string; }[] = [];
for (const suit of suits) {
  for (const rank of ranks) {
    cards.push({
      isFaceUp: true,
      rank,
      red: suit === '♥' || suit === '♦',
      suit,
    });
  }
}

export const Puzzle = ({
  // config,
  // data,
  // onConfig,
  // onProgress,
  // onFailure,
  // onSuccess,
  ...props
}: PuzzleProps) => {
  const [TableauCards, setTableauCards] = useState<{ isFaceUp: boolean; rank: string; red: boolean; suit: string; }[]>([]);
  const [StockCards, setStockCards] = useState<{ isFaceUp: boolean; rank: string; red: boolean; suit: string; }[]>([]);

  useEffect(() => {
    const shuffledCards = [...cards].sort(() => Math.random() - 0.5);
    setTableauCards(shuffledCards.slice(0, 28));
    setStockCards(shuffledCards.slice(28));
  }, []);
  return (
    
    <div className="flex flex-col px-2 w-full max-w-screen-lg mx-auto">
      {props.preview && (
        <React.Fragment>
          {/* <div>
            User is previewing the puzzle. Display any
            configurations here that the user should set like 
            puzzle difficulty
          </div>
          <div>
            Use the onConfig function to update the 
            puzzle configurations
          </div> */}
        </React.Fragment>
      )}
      {/* 
        <div>Your Puzzle Goes Here</div>
        <div>
          Use the onProgress function to update the puzzle progress
          so that the user does not have to start over if they close
          the puzzle
        </div>   
      */}
      {/* Foundation component */}
      <div className='flex justify-between'>
        <StockPile cards={ StockCards } />
        <Foundation suits={ suits } /> 
      </div>
      
      <Tableau cards={ TableauCards } />
     
      {/*
        <button className='border' onClick={ () => onFailure() }>fail</button>
        <button className='border' onClick={ () => onSuccess() }>succeed</button> 
      */}
    </div>
  );
};

