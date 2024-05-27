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

  // flip cards programmtically for saving state later
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

// wheck win 
export const checkWinningCondition = (tableauCards: CardProps[][], wasteCards: CardProps[], stockCards: CardProps[]) => {
  // Check if all cards in the tableau are face up
  const allCardsFaceUp = tableauCards.every((column) => column.every((card) => card.isFaceUp));
  // Check if the waste & stock pile is empty
  const wasteEmpty = wasteCards.length === 0;
  const stockEmpty = stockCards.length === 0;
  return allCardsFaceUp && wasteEmpty && stockEmpty;
};

export const moveCardsAfterWin = ({
  tableauCards,
  setTableauCards,
  suitCards,
  setSuitCards,
}: 
  {tableauCards: CardProps[][];
  setTableauCards: React.Dispatch<React.SetStateAction<CardProps[][]>>;
  suitCards: Array<CardProps[]>;
  setSuitCards: React.Dispatch<React.SetStateAction<CardProps[][]>>;
  }) => {

  const anyCardsLeftInTableau = tableauCards.some(column => column.length > 0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tableauCards.forEach((column: any[], columnIndex: number) => {
    const lastCard = column[column.length-1];
    if (lastCard) {
      suitCards.forEach((suit, suitIndex) => {
        const validMove = isValidFoundationMove([lastCard], suit, suitIndex);
        if (validMove) {
          const newFoundation = [...suitCards];
          const newTableau = [...tableauCards];
          newFoundation[suitIndex].push(lastCard);
          newTableau[columnIndex] = newTableau[columnIndex].slice(0, -1);
          setTableauCards(newTableau);
          tableauCards = newTableau;
          setSuitCards(newFoundation);
        }
      });
    }
  });

  if (anyCardsLeftInTableau) {
    moveCardsAfterWin({
      setSuitCards,
      setTableauCards,
      suitCards,
      tableauCards,
    });
  } else {
    return;
  }

};