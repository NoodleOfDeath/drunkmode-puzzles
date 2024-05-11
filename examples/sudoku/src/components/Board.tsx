import React from 'react';

import { PuzzleProps } from 'drunkmode-puzzles';
import styled from 'styled-components';

import { Cell } from './Cell';
import { CellCoordinate, Grid } from './Grid';
import { SudokuGrid, SudokuValue } from './types';
import { valueIsValidInGrid } from './utils';

export type NumberSelectorProps = {
  range?: 4 | 9;
  cellSize?: number;
  remainingNumbers: number[];
  onSelect: (value?: SudokuValue) => void;
};

const StyledNumberSelector = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  align-items: center;
`;

export const NumberSelector = ({ 
  range = 9,
  cellSize = 30,
  remainingNumbers,
  onSelect,
  ...props
}: NumberSelectorProps) => {
  return (
    <StyledNumberSelector 
      { ...props }>
      {Array(range + 1).fill(0).map((_, i) => {
        const value = i as SudokuValue;
        return (
          <Cell
            size={ cellSize }
            style={ { 
              opacity: i > 0 && !remainingNumbers.includes(i) ? 0.25 : 1,
              textDecorationLine: 'none',
            } }
            key={ `number-${value}` }
            value={ value ? value : '' }
            onSelect={ (value) => (i === 0 || (i > 0 && remainingNumbers.includes(i))) && onSelect?.(value as SudokuValue) }>
            { value ? value : '⌫' }
          </Cell>
        );
      })}
    </StyledNumberSelector>
  );
};

const StyledBoard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

export type BoardProps = PuzzleProps & {
  range?: 4 | 9;
  values?: SudokuGrid;
  startingValues: SudokuGrid;
};

export type BoardRef = {
  reset: () => void;
};

export const Board = React.forwardRef(function Board({ 
  range = 9,
  startingValues: startingValues0,
  values: values0 = startingValues0,
  onProgress,
  onMistake,
  onSuccess,
  ...props
}: BoardProps, ref: React.ForwardedRef<BoardRef>) {

  const [layout, setLayout] = React.useState<{ width: number; height: number }>();
  const [selectedCell, setSelectedCell] = React.useState<CellCoordinate>();
  const [values, setValues] = React.useState(values0);
  
  const fixedCells = React.useMemo(() => startingValues0.map((cells) => cells.map((cell, col) => cell ? col : undefined)).filter(Boolean) as number[][], [startingValues0]);
  const [invalidCells, setInvalidCells] = React.useState<CellCoordinate[]>([]);

  const cellProps = React.useMemo(() => values0.map((cells, row) => cells.map((cell, col) => ({
    fixed: fixedCells[row]?.includes(col),
    invalid: invalidCells.some((c) => c.row === row && c.col === col),
  }))), [fixedCells, invalidCells, values0]);
  
  const remainingNumbers = React.useMemo(() => [...Array(range).keys()].map((n) => n + 1).filter((n) => values.flat().filter((v) => `${v}` === `${n}`).length < range), [values, range]);
  
  const cellSize = React.useMemo(() => Math.floor(Math.min(layout?.width ?? 0, layout?.height ?? 0) / range), [layout, range]);
  
  const validate = React.useCallback((values: SudokuGrid, row: number, col: number) => {
    const value = values[row][col];
    if (!value || valueIsValidInGrid(values, range, row, col, value as SudokuValue)) {
      setInvalidCells((prev) => prev.filter((cell) => cell.row !== row || cell.col !== col));
    } else {
      setInvalidCells((prev) => [...prev, { col, row }]);
    }
  }, [range]);
  
  const setAndValidateCell = React.useCallback((row: number, col: number, value: SudokuValue) => {
    let userFailed = false;
    setValues((prev) => {
      
      const newValues = prev.map((row) => row.slice());
      newValues[row][col] = value;
      
      const validate = (r: number, c: number) => {
        const value = newValues[r][c];
        if (!value || valueIsValidInGrid(newValues, range, r, c, value as SudokuValue)) {
          setInvalidCells((prev) => prev.filter((cell) => cell.row !== r || cell.col !== c));
        } else {
          if (r === row && c === col) {
            userFailed = true;
          }
          setInvalidCells((prev) => [...prev, { col: c, row: r }]);
        }
      };
      
      for (let i = 0; i < range; i++) {
        for (let j = 0; j < range; j++) {
          validate(i, j);
        }
      }

      if (userFailed) {
        onMistake();
      }
      
      onProgress?.(JSON.stringify({ 
        startingValues: startingValues0,
        values: newValues,
      }));
          
      return newValues;
    });
  }, [onProgress, startingValues0, onMistake, range]);

  React.useEffect(() => {
    if (values.length === 0) {
      return;
    }
    if (values.flat().filter(Boolean).length === (range * range) && invalidCells.length === 0) {
      onSuccess();
    }
  }, [values, invalidCells, onSuccess, range]);
  
  React.useEffect(() => {
    setValues(values0);
    if (values0.length === 0) {
      return;
    }
    for (let i = 0; i < range; i++) {
      for (let j = 0; j < range; j++) {
        validate(values0, i, j);
      }
    }
  }, [values0, validate, range]);
  
  React.useLayoutEffect(() => {
    function updateLayout() {
      setLayout((prev) => {
        if (prev?.width === window.innerWidth && 
            prev?.height === window.innerHeight) {
          return prev;
        }
        const newSize = {
          height: window.innerHeight,
          width: window.innerWidth,
        };
        return newSize;
      });
    }
    window.addEventListener('resize', updateLayout);
    updateLayout();
    return () => {
      window.removeEventListener('resize', updateLayout);
    };
  }, []);
  
  React.useImperativeHandle(ref, () => ({
    reset: () => {
      setValues(startingValues0);
      setInvalidCells([]);
    },
  }), [startingValues0]);

  return (
    <StyledBoard> 
      <Grid 
        range={ range }
        rows={ values }
        cellProps={ cellProps }
        cellSize={ 30 }
        selectedCell={ selectedCell }
        onCellSelect={ setSelectedCell }
        { ...props } />
      <NumberSelector
        range={ range }
        cellSize={ cellSize * 0.7 }
        remainingNumbers={ remainingNumbers }
        onSelect={ (value) => {
          if (!selectedCell || fixedCells[selectedCell.row]?.includes(selectedCell.col)) {
            return;
          }
          setAndValidateCell(selectedCell.row, selectedCell.col, value ?? 0);
        } } />
    </StyledBoard>
  );
});