import React from 'react';

import styled from 'styled-components';

export type CellProps = React.PropsWithChildren<Omit<React.CSSProperties, 'translate'> & {
  size?: number | 'auto';
  width?: number | 'auto';
  height?: number | 'auto';
  value?: React.ReactNode;
  defaultProps?: CellProps;
  fixed?: boolean;
  fixedProps?: CellProps;
  selected?: boolean;
  selectedProps?: CellProps;
  invalid?: boolean;
  invalidProps?: CellProps;
  background?: string;
  color?: string;
  fontWeight?: string;
  style?: React.CSSProperties;
  onSelect?: (value?: React.ReactNode) => void;
}>;

const StyledCell = styled.div`
  background: white;
  color: black;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const TEXT_PROP_NAMES = [
  'color', 'fontWeight',
] as const;

export const Cell = ({
  size,
  width = size,
  height = size,
  value,
  children = value,
  defaultProps = {
    background: 'white',
    color: 'black',
    textDecorationLine: 'underline',
  },
  fixed,
  fixedProps = { 
    fontWeight: 'bold',
    textDecorationLine: 'none',
  },
  selected,
  selectedProps = { background: '#ccc' },
  invalid,
  invalidProps = { 
    background: 'red', 
    color: 'white',
  },
  onSelect,
  ...props
}: CellProps) => {

  const textProps = React.useMemo(() => Object.fromEntries(TEXT_PROP_NAMES.map((prop) => [
    prop, 
    fixed && fixedProps?.[prop] != null ? fixedProps?.[prop] : 
      invalid && invalidProps?.[prop] != null ? invalidProps?.[prop] : 
        selected && selectedProps?.[prop] != null ? selectedProps?.[prop] : 
          defaultProps?.[prop],
  ])), [defaultProps, fixed, fixedProps, selected, selectedProps, invalid, invalidProps]);
    
  const containerProps = React.useMemo(() => ({
    ...defaultProps,
    ...props,
    ...(selected ? selectedProps : {}),
    ...(invalid ? invalidProps : {}),
    ...(fixed ? fixedProps : {}),
  }), [defaultProps, props, selected, selectedProps, invalid, invalidProps, fixed, fixedProps]);

  return (
    <StyledCell
      onClick={ () => onSelect?.(value) }
      { ...props }
      style={ {
        height: height === 'auto' ? 'auto' : `${height}px`,
        lineHeight: `${height}px`,
        width: width === 'auto' ? 'auto' : `${width}px`,
        ...textProps,
        ...containerProps, 
        ...props.style,
      } }>
      {children || ''}
    </StyledCell>
  );
};