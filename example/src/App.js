import React from 'react';
import { PuzzleMessage } from 'drunkmode-puzzles';

function App() {
  return (
    <div className="App">
      <button onClick={() => PuzzleMessage.onFailure('You failed!')}>Fail</button>
      <button onClick={() => PuzzleMessage.onSuccess('You succeeded!')}>Succeed</button>
    </div>
  );
}

export default App;
