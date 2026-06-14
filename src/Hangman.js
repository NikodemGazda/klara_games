import React, { useEffect, useState } from 'react';
import './Hangman.css';
import { useAuth } from './AuthContext';
import Leaderboard from './Leaderboard';

const WORDS = [
  'forest','tree','leaf','bark','branch','trunk','moss','fern','pine','oak','maple','birch','willow','cedar','spruce','fir','acorn','pinecone','cone','stump','roots','sapling','seedling','canopy','undergrowth','grove','glade','clearing','meadow','path','trail','river','stream','brook','waterfall','pond','lake','stone','rock','boulder','hill','valley','cliff','cave','mossy','orchard','blossom','bud','budburst','flower','rose','lily','tulip','daisy','sunflower','marigold','iris','violet','peony','daffodil','poppy','dandelion','petal','stem','orchid','blossom','apple','pear','plum','peach','cherry','grape','orange','lemon','lime','banana','strawberry','blueberry','raspberry','blackberry','cranberry','fig','melon','kiwi','nectarine','coconut','mushroom','toadstool','fungus','squirrel','rabbit','deer','fox','wolf','bear','owl','hawk','woodpecker','robin','raccoon','hedgehog','badger','insect','butterfly','bee','dragonfly','ant','spider','nest','twig','soil','earth','shade','sunlight','rain','mist','fog','dew','breeze','wind','unicorn','fairy','elf','wizard','dragon','goblin','troll','castle','magic','spell','wand','potion','pixie','griffin','phoenix','myth','enchanted','mystic'
];
const QWERTY_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

function HangmanSVG({ wrong }) {
  return (
    <svg width="160" height="240" viewBox="0 0 160 240" aria-hidden>
      <line x1="20" y1="220" x2="140" y2="220" stroke="#333" strokeWidth="4" />
      <line x1="40" y1="20" x2="40" y2="220" stroke="#333" strokeWidth="4" />
      <line x1="40" y1="20" x2="110" y2="20" stroke="#333" strokeWidth="4" />
      <line x1="110" y1="20" x2="110" y2="40" stroke="#333" strokeWidth="4" />

      {wrong > 0 && <circle cx="110" cy="60" r="16" stroke="#111" strokeWidth="3" fill="transparent" />}
      {wrong > 1 && <line x1="110" y1="76" x2="110" y2="130" stroke="#111" strokeWidth="3" />}
      {wrong > 2 && <line x1="110" y1="90" x2="90" y2="110" stroke="#111" strokeWidth="3" />}
      {wrong > 3 && <line x1="110" y1="90" x2="130" y2="110" stroke="#111" strokeWidth="3" />}
      {wrong > 4 && <line x1="110" y1="130" x2="95" y2="165" stroke="#111" strokeWidth="3" />}
      {wrong > 5 && <line x1="110" y1="130" x2="125" y2="165" stroke="#111" strokeWidth="3" />}
    </svg>
  );
}

export default function Hangman({ fullPage = false }) {
  const [target, setTarget] = useState('');
  const [guesses, setGuesses] = useState(new Set());
  const [wrongCount, setWrongCount] = useState(0);
  const MAX_WRONG = 6;
  const [activeKey, setActiveKey] = useState(null);
  const [hoverKey, setHoverKey] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [gameTime, setGameTime] = useState(null);
  const { user, token, isGuest } = useAuth();

  useEffect(() => resetGame(), []);

  useEffect(() => {
    function handleKeyPress(e) {
      const letter = e.key.toLowerCase();
      // Check if the key is a letter a-z
      if (/^[a-z]$/.test(letter)) {
        e.preventDefault();
        
        // Check if game is already over
        const isWin = target.split('').every(l => guesses.has(l));
        const isLose = wrongCount >= MAX_WRONG;
        
        if (isWin || isLose) {
          alert("Click 'New Word' to start again");
          return;
        }
        
        setActiveKey(letter);
        // Simulate button press timing
        setTimeout(() => {
          handleGuess(letter);
          setActiveKey(null);
        }, 50);
      }
    }

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [guesses, wrongCount, target]);

  function resetGame() {
    const w = WORDS[Math.floor(Math.random() * WORDS.length)];
    setTarget(w);
    setGuesses(new Set());
    setWrongCount(0);
    setStartTime(null);
    setGameTime(null);
  }

  function submitScore(finalTime) {
    if (!user || isGuest) {
      console.log('Guest mode - not submitting score');
      return;
    }

    fetch('http://localhost:5000/api/scores', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        username: user.username,
        gameName: 'hangman',
        score: finalTime,
      }),
    }).catch(err => console.error('Error submitting score:', err));
  }

  function handleGuess(letter) {
    if (guesses.has(letter) || wrongCount >= MAX_WRONG) return;
    const next = new Set(guesses);
    next.add(letter);
    setGuesses(next);
    if (!target.includes(letter)) {
      setWrongCount(c => Math.min(MAX_WRONG, c + 1));
    }
  }

  // Track when game starts
  useEffect(() => {
    if (target && !startTime) {
      setStartTime(Date.now());
    }
  }, [target, startTime]);

  // Submit score when player wins
  useEffect(() => {
    const revealed = target.split('').map(l => (guesses.has(l) ? l : '_')).join(' ');
    const isWin = target.split('').every(l => guesses.has(l));
    
    if (isWin && startTime && target) {
      const finalTime = (Date.now() - startTime) / 1000; // Convert to seconds
      setGameTime(finalTime);
      submitScore(finalTime);
    }
  }, [guesses, target, startTime]);

  const revealed = target.split('').map(l => (guesses.has(l) ? l : '_')).join(' ');
  const isWin = target.split('').every(l => guesses.has(l));
  const isLose = wrongCount >= MAX_WRONG;

  const containerMinHeight = fullPage ? 'calc(100vh - 120px)' : undefined;

  return (
    <>
      <div className={`hangman-container ${fullPage ? 'full-page' : ''}`}>
        <div className="hangman-vignette" />

        <div className="hangman-content">
          <div className="hangman-header">
            <strong className="hangman-title">Hangman</strong>
            <div>
              <button onClick={resetGame}>New Word</button>
            </div>
          </div>

          <div className="hangman-main">
            <div className="hangman-svg-container">
              <div className="hangman-svg-wrapper">
                <div className="hangman-svg-filter">
                  <HangmanSVG wrong={wrongCount} />
                </div>
              </div>
            </div>

            <div className="hangman-game">
              <div className="hangman-word">{revealed}</div>
              <div className="hangman-stats">Wrong: {wrongCount} / {MAX_WRONG}</div>

              {gameTime && (
                <div className="hangman-time">⏱️ Completed in {gameTime.toFixed(2)} seconds</div>
              )}

              <div className="hangman-status">
                {isWin && <div className="hangman-win">You won! 🎉</div>}
                {isLose && <div className="hangman-lose">You lost — word was: {target}</div>}
              </div>

              <div className="hangman-keyboard">
                {QWERTY_ROWS.map((row, i) => (
                  <div key={i} className="hangman-row">
                    {row.split('').map(letter => {
                      const used = guesses.has(letter);
                      const isActive = activeKey === letter;
                      return (
                        <button
                            key={letter}
                            onMouseDown={() => setActiveKey(letter)}
                            onMouseUp={() => { setActiveKey(null); handleGuess(letter); }}
                            onMouseLeave={() => { setActiveKey(null); setHoverKey(null); }}
                            onMouseEnter={() => setHoverKey(letter)}
                            onTouchStart={() => setActiveKey(letter)}
                            onTouchEnd={() => { setActiveKey(null); handleGuess(letter); setHoverKey(null); }}
                            disabled={used || isWin || isLose}
                            className={`hangman-button ${isActive || hoverKey === letter ? 'active' : ''}`}
                          >
                            {letter}
                          </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {fullPage && <Leaderboard gameName="hangman" />}
    </>
  );
}
