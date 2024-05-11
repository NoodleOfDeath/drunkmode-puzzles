import React from 'react';

import styled from 'styled-components';

import { Cell, CellProps } from './Cell';

export type CellCoordinate = {
  row: number;
  col: number;
};

export type GridProps = {
  range?: 4 | 9;
  cols?: number;
  rows?: React.ReactNode[][];
  gap?: number;
  cellProps?: CellProps[][];
  cellSize?: number;
  selectedCell?: CellCoordinate
  onCellSelect?: (cell?: CellCoordinate) => void;
};

const StyledGrid = styled.div`
  display: flex;
  flex-direction: column;
  margin: auto;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: #000;
`;

const StyledRow = styled.div`
  display: flex;
`;

export const Grid = ({ 
  range = 9,
  rows,
  cellProps,
  cellSize = 30,
  gap = 3,
  selectedCell,
  onCellSelect,
  ...props
}: GridProps) => {
  return (
    <StyledGrid { ...props }>
      {rows?.map((cells, row) => {
        return (
          <StyledRow
            style={ { marginBottom: row > Math.sqrt(range) + 1 ? 0 : (row + 1) % Math.sqrt(range) === 0 ? 2 * gap : gap } }
            key={ `row-${row}` }>
            {cells.map((value, col) => {
              return (
                <Cell
                  key={ `cell-${row}-${col}-${value}` }
                  size={ cellSize }
                  style={ { marginRight: col > Math.sqrt(range) + 1 ? 0 : (col + 1) % Math.sqrt(range) === 0 ? 2 * gap : gap } }
                  value={ value || '' }
                  selected={ selectedCell?.row === row && selectedCell?.col === col }
                  onSelect={ () => onCellSelect?.({ col, row }) } 
                  { ...cellProps?.[row]?.[col] } />
              );
            })}
          </StyledRow>
        );
      })}
    </StyledGrid>
  );
};