# Drunk Mode Puzzles <!-- omit in toc -->

<p align="center">
  <a href="https://github.com/noodleofdeath/drunkmode-puzzles/blob/HEAD/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="This package is released under the MIT license." />
  </a>
  <a href="https://www.npmjs.org/package/drunkmode-puzzles">
    <img src="https://img.shields.io/npm/v/drunkmode-puzzles?color=brightgreen&label=npm%20package" alt="Current npm package version." />
  </a>
  <a href="https://www.npmjs.org/package/drunkmode-puzzles">
    <img src="https://img.shields.io/npm/dt/drunkmode-puzzles" alt="Npm downloads." />
  </a>
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs welcome!" />
</p>

This library contains the core logic needed to create custom puzzles for the Drunk Mode app that can be submitted to the Drunk Mode app for use in the app.

## Table of Contents <!-- omit in toc -->

- [Install](#install)
- [Usage](#usage)
- [Package Your Puzzle](#package-your-puzzle)

## Install

```bash
npm install drunkmode-puzzles
```

## Usage

First create a web app that imports the `PuzzleMessage` class from the `drunkmode-puzzles` package. Your puzzle does not need to be a React component, but it can be if you want to use React. The only requirement is that you call `PuzzleMessage.onSuccess` and `PuzzleMessage.onFailure` when the user completes or fails the puzzle.

```typescript
import React from 'react';

import { PuzzleMessage } from 'drunkmode-puzzles';

const MyPuzzle = () => {
  return (
    <div>
      <button onClick={() => PuzzleMessage.onSuccess('You solved the puzzle!')}>
        Solve Puzzle
      </button>
      <button onClick={() => PuzzleMessage.onFailure('You failed to solve the puzzle!')}>
        Fail Puzzle
      </button>
    </div>
  );
};

export default MyPuzzle;
```

## Package Your Puzzle

Once you have created your puzzle, you can package it up and submit it to the Drunk Mode app. 

First compile your puzzle into a single js or html file called `index.js` or `index.html`. Create a new directory and place your compiled puzzle file in the directory. Then create a `puzzle.json` file in the same directory with the following format:

```json
{
  "name": "my-puzzle",
  "displayName": "My Puzzle",
  "description": "This is a description of my puzzle.",
  "version": "1.0.0",
  "main": "index.js"
}
```
  
Finally, zip the directory and submit it to the Drunk Mode app. 