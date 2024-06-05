// Logic.ts
import {
  CardProps,
  RANKS,
  SUITS,
} from '~/SolitairePuzzle';

export const handleDragEnd = ({
  source,
  destination,
  tableauCards,
  suitCards,
  wasteCards,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  source: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  destination: any;
  tableauCards: CardProps[][];
  suitCards: Array<CardProps[]>;
  wasteCards: CardProps[];
}) => {

  const uTableau = [...tableauCards];
  const uSuit = [...suitCards];
  let uWaste = [...wasteCards];
  const uFlipped: CardProps[] = [];
  let failure = true;

  if (!destination || source === destination) {
    return {
      failure: false,
      flippedCards: uFlipped,
      suitCards: uSuit,
      tableauCards: uTableau, 
      wasteCards: uWaste, 
    };
  }

  const sParts = source.droppableId.split('-');
  const dParts = destination.droppableId.split('-');

  const isCol = (parts: string[]) => parts[0] === 'col';
  const isSuit = (parts: string[]) => parts[0] === 'suit';

  const sColIdx = parseInt(sParts[1]);
  const dColIdx = parseInt(dParts[1]);
  const sIdx = source.index;

  if (isCol(sParts)) {
    if (isCol(dParts) && sColIdx !== dColIdx) {
      // Moving cards between tableau columns
      const cardsToMove = uTableau[sColIdx].slice(sIdx);
      const validMove = isValidTableauMove(cardsToMove, uTableau[dColIdx]);
      if (validMove) {
        uTableau[dColIdx] = uTableau[dColIdx].concat(cardsToMove);
        uTableau[sColIdx] = uTableau[sColIdx].slice(0, sIdx);
        failure = false;
      }
    } else if (isSuit(dParts)) {
      // Moving cards from tableau to foundation
      const cardsToMove = uTableau[sColIdx].slice(sIdx);
      const validMove = isValidFoundationMove(cardsToMove, uSuit[dColIdx], dColIdx);
      if (validMove) {
        uSuit[dColIdx] = uSuit[dColIdx].concat(cardsToMove);
        uTableau[sColIdx] = uTableau[sColIdx].slice(0, sIdx);
        failure = false;
      }
    }
  } else if (sParts[0] === 'waste') {
    // Moving cards from waste to tableau or foundation
    const cardsToMove = uWaste.slice(-1);
    if (isCol(dParts)) {
      const validMove = isValidTableauMove(cardsToMove, uTableau[dColIdx]);
      if (validMove) {
        uTableau[dColIdx] = uTableau[dColIdx].concat(cardsToMove);
        uWaste = uWaste.slice(0, -1);
        failure = false;
      }
    } else if (isSuit(dParts)) {
      const validMove = isValidFoundationMove(cardsToMove, uSuit[dColIdx], dColIdx);
      if (validMove) {
        uSuit[dColIdx] = uSuit[dColIdx].concat(cardsToMove);
        uWaste = uWaste.slice(0, -1);
        failure = false;
      }
    }
  } else if (isSuit(sParts) && isCol(dParts)) {
    // Moving cards from foundation to tableau
    const cardsToMove = uSuit[sColIdx].slice(sIdx);
    const validMove = isValidTableauMove(cardsToMove, uTableau[dColIdx]);
    if (validMove) {
      uTableau[dColIdx] = uTableau[dColIdx].concat(cardsToMove);
      uSuit[sColIdx] = uSuit[sColIdx].slice(0, sIdx);
      failure = false;
    }
  }

  // flip cards programmatically for saving state later
  uTableau.forEach((column) => {
    if (column.length === 0) {
      return;
    }
    const lastCard = column[column.length - 1];
    if (!lastCard.isFaceUp) {
      lastCard.isFaceUp = true;
      uFlipped.push(lastCard);
    }
  });

  return {
    failure,
    flippedCards: uFlipped,
    suitCards: uSuit,
    tableauCards: uTableau,
    wasteCards: uWaste,
  };

};

const isValidTableauMove = (cardsToMove: CardProps[], destinationColumn: CardProps[]) => {
  if (destinationColumn.length === 0) {
    return cardsToMove[0].rank === 'K'; 
  }
  const lastCard = destinationColumn[destinationColumn.length - 1];
  const firstCardToMove = cardsToMove[0];
  return (
    RANKS.indexOf(firstCardToMove.rank) === RANKS.indexOf(lastCard.rank) -1 &&
    lastCard.red !== firstCardToMove.red
  );
};

const isValidFoundationMove = (cardsToMove: CardProps[], foundationPile: CardProps[], suitIndex: number) => {
  if (foundationPile.length === 0) {
    return cardsToMove[0].rank === 'A' && cardsToMove[0].suit === Object.keys(SUITS)[suitIndex];
  }
  const lastCard = foundationPile[foundationPile.length - 1];
  const firstCardToMove = cardsToMove[0];
  return (
    firstCardToMove.suit === lastCard.suit &&
    RANKS.indexOf(firstCardToMove.rank) === RANKS.indexOf(lastCard.rank) +1
  );
};

// check win 
export const checkWinningCondition = (tableauCards: CardProps[][], wasteCards: CardProps[], stockCards: CardProps[]) => {
  // Check if all cards in the tableau are face up
  const allCardsFaceUp = tableauCards.every((column) => column.every((card) => card.isFaceUp));
  // Check if the waste & stock pile is empty
  const wasteEmpty = wasteCards.length === 0;
  const stockEmpty = stockCards.length === 0;
  return allCardsFaceUp && wasteEmpty && stockEmpty;
};

export const moveCardsAfterWin = async ({
  setState,
  tableauCards,
  suitCards,
}: 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  {setState: any;
    tableauCards: CardProps[][];
  suitCards: Array<CardProps[]>;
  }) => {
  
  const delay = () => new Promise(resolve => setTimeout(resolve, (30)));

  const anyCardsLeftInTableau = tableauCards.some(column => column.length > 0);

  for (let columnIndex = 0; columnIndex < tableauCards.length; columnIndex++) {
    const column = tableauCards[columnIndex];
    const lastCard = column[column.length - 1];
    if (lastCard) {
      for (let suitIndex = 0; suitIndex < suitCards.length; suitIndex++) {
        const suit = suitCards[suitIndex];
        const validMove = isValidFoundationMove([lastCard], suit, suitIndex);
        if (validMove) {
          const newFoundation = [...suitCards];
          const newTableau = [...tableauCards];
          newFoundation[suitIndex] = [...newFoundation[suitIndex], lastCard];
          newTableau[columnIndex] = newTableau[columnIndex].slice(0, -1);

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setState((prev: any)=>{
            return {
              ...prev, 
              suitCards: newFoundation,
              tableauCards: newTableau,
            };
          });

          await delay();

          tableauCards = newTableau;
          suitCards = newFoundation;

          break; 
        }
      }
    }
  }

  if (anyCardsLeftInTableau) {
    moveCardsAfterWin({
      setState,
      suitCards,
      tableauCards,
    });
  }
};

export const handleMultipleDrag = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  source: any,
  tableauCards: CardProps[][]
) => {
  
  const sParts = source.source.droppableId.split('-');
  if (sParts[0] === 'col') {
    
    const draggedCards = tableauCards[parseInt(sParts[1])].slice(source.source.index);
    const draggedCard = document.querySelector(`[data-rbd-draggable-id="${draggedCards[0].id}"]`) as HTMLElement;
    const translate = draggedCard.style.transform.match(/translate\(((-)?\d*.\d*)px, ((-)?\d*.\d*)px/);

    for (let i = 0; i < draggedCards.length; i++) {
      const draggedCard = document.querySelector(`[data-rbd-draggable-id="${draggedCards[i].id}"]`) as HTMLElement;
      if (draggedCard && i > 0 && translate) {

        const x = parseInt(translate[1]);
        const y = parseInt(translate[3]);

        draggedCard.style.transform = `translate(${x}px, ${y+ window.innerWidth*0.05}px)`;
        draggedCard.style.zIndex = `${i+5000}`;
      }
    }
  }
  
};

export const removeTranslate = (
  tableauCards: CardProps[][]
) => {
  for (let i = 0; i < tableauCards.length; i++) {
  
    for (let j = 0; j < tableauCards[i].length; j++) {
      const draggedCard = document.querySelector(`[data-rbd-draggable-id="${tableauCards[i][j].id}"]`) as HTMLElement;
      if (draggedCard) {
        draggedCard.style.transform = '';
        draggedCard.style.zIndex = '';
      }
    }
  }
};