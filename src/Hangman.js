import React, { useEffect, useState } from 'react';
import './Hangman.css';
import { useAuth } from './AuthContext';
import Leaderboard from './Leaderboard';
import publicAsset from './publicAsset';

const WORDS = [
  'forest','tree','leaf','bark','branch','trunk','moss','fern','pine','oak','maple','birch','willow','cedar','spruce','fir','acorn','pinecone','cone','stump','roots','sapling','seedling','canopy','undergrowth','grove','glade','clearing','meadow','path','trail','river','stream','brook','waterfall','pond','lake','stone','rock','boulder','hill','valley','cliff','cave','mossy','orchard','blossom','bud','budburst','flower','rose','lily','tulip','daisy','sunflower','marigold','iris','violet','peony','daffodil','poppy','dandelion','petal','stem','orchid','blossom','apple','pear','plum','peach','cherry','grape','orange','lemon','lime','banana','strawberry','blueberry','raspberry','blackberry','cranberry','fig','melon','kiwi','nectarine','coconut','mushroom','toadstool','fungus','squirrel','rabbit','deer','fox','wolf','bear','owl','hawk','woodpecker','robin','raccoon','hedgehog','badger','insect','butterfly','bee','dragonfly','ant','spider','nest','twig','soil','earth','shade','sunlight','rain','mist','fog','dew','breeze','wind','unicorn','fairy','elf','wizard','dragon','goblin','troll','castle','magic','spell','wand','potion','pixie','griffin','phoenix','myth','enchanted','mystic','moon','star','sky','cloud','snow','ice','frost','rainbow','shadow','light','dark','glow','sparkle','shiny','crystal','gem','feather','feathers','vine','ivy','thorn','bush','grass','reed','log','hollow','web','webs','shell','nut','berry','beetle','snail','slug','worm','frog','toad','snake','lizard','mouse','rat','mole','beaver','otter','duck','goose','swan','crow','raven','bat','moth','caterpillar','cricket','grasshopper','ladybug','witch','giant','mermaid','merman','ghost','spirit','monster','ogre','knight','king','queen','prince','princess','crown','throne','sword','shield','armor','treasure','gold','silver','coin','key','lock','door','gate','tower','bridge','map','book','scroll','ring','necklace','amulet','crystalball','orb','cloak','hood','boots','hat','cape','candle','flame','fire','ember','smoke','ash','dust','echo','whisper','secret','wish','dream','luck','fortune','surprise','adventure','journey','campfire','torch','lantern','rope','basket','bucket','barrel','fence','gatehouse','hut','cabin','tent','camp','campground','picnic','bench','statue','fountain'
];
const QWERTY_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

// The fairy is revealed one part at a time instead of the classic stick figure.
// Every file in `public/imgs/fairy parts/` is a crop of the SAME artwork drawn
// at the SAME scale (a 313x305 master frame), so we can rebuild the full fairy
// by lining the crops up on a shared canvas. The `left`/`top`/`width`/`height`
// values below are percentages of that 313x305 master and were measured from
// the source PNGs, which keeps each newly revealed part in the right place
// (e.g. the head stays put once the body appears).
const FAIRY_MASTER_WIDTH = 313;
const FAIRY_MASTER_HEIGHT = 305;

const FAIRY_STAGES = [
  { file: 'fairy_head.png', left: 29.712, top: 7.869, width: 37.06, height: 40 },
  { file: 'fairy_body.png', left: 23.003, top: 2.623, width: 48.882, height: 80.984 },
  { file: 'fairy_left_wing.png', left: 0.319, top: 0, width: 71.565, height: 83.607 },
  { file: 'fairy_right_wing.png', left: 0.319, top: 0.328, width: 99.361, height: 83.279 },
  { file: 'fairy_left_leg.png', left: 0.319, top: 0.328, width: 99.361, height: 99.344 },
  { file: 'fairy_all.png', left: 0, top: 0, width: 100, height: 100 },
];

function Fairy({ wrong }) {
  const stage = wrong > 0 ? FAIRY_STAGES[Math.min(wrong, FAIRY_STAGES.length) - 1] : null;

  return (
    <div
      className="fairy-frame"
      style={{ aspectRatio: `${FAIRY_MASTER_WIDTH} / ${FAIRY_MASTER_HEIGHT}` }}
    >
      {stage && (
        <img
          key={stage.file}
          className="fairy-image"
          src={publicAsset(`imgs/fairy parts/${stage.file}`)}
          alt=""
          draggable={false}
          style={{
            left: `${stage.left}%`,
            top: `${stage.top}%`,
            width: `${stage.width}%`,
            height: `${stage.height}%`,
          }}
        />
      )}
    </div>
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
          alert("Want to play again? Press New Word.");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      console.log('Sorry. It looks like you do not have an account, so we can not show your score online. If you want to show your score make an account.Sorry. It looks like you do not have an account, so we can not show your score online. If you want to show your score make an account.');
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
    }).catch(err => console.error('Something went wrong. Please try again, sorry that it is not working. :', err));
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
    // eslint-disable-next-line no-unused-vars
    const revealed = target.split('').map(l => (guesses.has(l) ? l : '_')).join(' ');
    const isWin = target.split('').every(l => guesses.has(l));
    
    if (isWin && startTime && target) {
      const finalTime = (Date.now() - startTime) / 1000; // Convert to seconds
      setGameTime(finalTime);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      submitScore(finalTime);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guesses, target, startTime]);

  const revealed = target.split('').map(l => (guesses.has(l) ? l : '_')).join(' ');
  const isWin = target.split('').every(l => guesses.has(l));
  const isLose = wrongCount >= MAX_WRONG;

  // eslint-disable-next-line no-unused-vars
  const containerMinHeight = fullPage ? 'calc(100dvh - 120px)' : undefined;

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
                  <Fairy wrong={wrongCount} />
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
                {isWin && <div className="hangman-win">You won! Good Job!! 🎉</div>}
                {isLose && <div className="hangman-lose">You couldn't find this word... YET. One day you will get it 🙂! The word was: {target}</div>}
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
                            style={{ backgroundImage: `url(${publicAsset('imgs/wood_block.png')})` }}
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
