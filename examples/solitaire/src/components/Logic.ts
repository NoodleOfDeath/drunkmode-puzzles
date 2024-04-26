// Logic.ts
import {
  CardType,
  ranks,
  suits,
} from './../SolitairePuzzle';

export const handleDragEnd = ({
  source,
  destination,
  tableauCards,
  setTableauCards,
  suitCards,
  setSuitCards,
  wasteCards,
  setWasteCards,
}: {
  source: any;
  destination: any;
  tableauCards: CardType[][];
  setTableauCards: React.Dispatch<React.SetStateAction<CardType[][]>>;
  suitCards: Array<CardType[]>;
  setSuitCards: React.Dispatch<React.SetStateAction<CardType[][]>>;
  wasteCards: CardType[];
  setWasteCards: React.Dispatch<React.SetStateAction<CardType[]>>;
}) => {
  if (!destination) {
    console.log('Oops');
    return;
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
      const uTableau = [...tableauCards];
      const cardsToMove = uTableau[sColIdx].slice(sIdx);
      const validMove = isValidTableauMove(cardsToMove, uTableau[dColIdx]);
      if (validMove) {
        uTableau[dColIdx] = uTableau[dColIdx].concat(cardsToMove);
        uTableau[sColIdx] = uTableau[sColIdx].slice(0, sIdx);
        setTableauCards(uTableau);
      }
    } else if (isSuit(dParts)) {
      // Moving cards from tableau to foundation
      const uSuit = [...suitCards];
      const uTableau = [...tableauCards];
      const cardsToMove = uTableau[sColIdx].slice(sIdx);
      const validMove = isValidFoundationMove(cardsToMove, uSuit[dColIdx], dColIdx);
      if (validMove) {
        uSuit[dColIdx] = uSuit[dColIdx].concat(cardsToMove);
        uTableau[sColIdx] = uTableau[sColIdx].slice(0, sIdx);
        setSuitCards(uSuit);
        setTableauCards(uTableau);
      }
    }
  } else if (sParts[0] === 'waste') {
    // Moving cards from waste to tableau or foundation
    const uTableau = [...tableauCards];
    const cardsToMove = wasteCards.slice(-1);
    if (isCol(dParts)) {
      const validMove = isValidTableauMove(cardsToMove, uTableau[dColIdx]);
      if (validMove) {
        uTableau[dColIdx] = uTableau[dColIdx].concat(cardsToMove);
        setTableauCards(uTableau);
        setWasteCards(wasteCards.slice(0, -1));
      }
    } else if (isSuit(dParts)) {
      const uSuit = [...suitCards];
      const validMove = isValidFoundationMove(cardsToMove, uSuit[dColIdx], dColIdx);
      if (validMove) {
        uSuit[dColIdx] = uSuit[dColIdx].concat(cardsToMove);
        setSuitCards(uSuit);
        setWasteCards(wasteCards.slice(0, -1));
      }
    }
  } else if (isSuit(sParts) && isCol(dParts)) {
    // Moving cards from foundation to tableau
    const uSuit = [...suitCards];
    const uTableau = [...tableauCards];
    const cardsToMove = uSuit[sColIdx].slice(sIdx);
    const validMove = isValidTableauMove(cardsToMove, uTableau[dColIdx]);
    if (validMove) {
      uTableau[dColIdx] = uTableau[dColIdx].concat(cardsToMove);
      uSuit[sColIdx] = uSuit[sColIdx].slice(0, sIdx);
      setSuitCards(uSuit);
      setTableauCards(uTableau);
    }
  }
};

const isValidTableauMove = (cardsToMove: CardType[], destinationColumn: CardType[]) => {
  if (destinationColumn.length === 0) {
    return cardsToMove[0].rank === 'K'; 
  }
  const lastCard = destinationColumn[destinationColumn.length - 1];
  const firstCardToMove = cardsToMove[0];
  return (
    ranks.indexOf(firstCardToMove.rank) === ranks.indexOf(lastCard.rank) -1 &&
    lastCard.red !== firstCardToMove.red
  );
};

const isValidFoundationMove = (cardsToMove: CardType[], foundationPile: CardType[], suitIndex: number) => {
  if (foundationPile.length === 0) {
    return cardsToMove[0].rank === 'A' && cardsToMove[0].suit === suits[suitIndex];
  }
  const lastCard = foundationPile[foundationPile.length - 1];
  const firstCardToMove = cardsToMove[0];
  return (
    firstCardToMove.suit === lastCard.suit &&
    ranks.indexOf(firstCardToMove.rank) === ranks.indexOf(lastCard.rank) +1
  );
};

// wheck win 
export const checkWinningCondition = (tableauCards: CardType[][], wasteCards: CardType[], stockCards: CardType[]) => {
  // Check if all cards in the tableau are face up
  const allCardsFaceUp = tableauCards.every((column) => column.every((card) => card.isFaceUp));
  // Check if the waste & stock pile is empty
  const wasteEmpty = wasteCards.length === 0;
  const stockEmpty = stockCards.length === 0;
  return allCardsFaceUp && wasteEmpty && stockEmpty;
};