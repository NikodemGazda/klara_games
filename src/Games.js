import React from 'react';
import { Link } from 'react-router-dom';
import './Game.css';

export default function Games() {
  const games = [
      { title: 'Hang Man', img_path: 'imgs/ai.png' },
      { title: 'Tic Tac Toe', img_path: 'imgs/ai2.png' },
      { title: 'Picture puzzle game', img_path: 'imgs/bed.png' },
      { title: 'Sound Board', img_path: 'imgs/floor.png' },
      { title: 'Cat Location Guessing Game', img_path: 'imgs/tilt.png' },
      { title: 'What song matches your age?', img_path: 'imgs/table.png' },
  ];

  return (
    <main className="games-main">
      <h1>Browse Our Selection</h1>
      <section className="games-section">
        {
            games.map(game => {
                const slug = game.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                return (
                  <Link key={slug} to={`/games/${slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <GameCard title={game.title} img_path={game.img_path} />
                  </Link>
                );
            })
        }
      </section>
    </main>
  );
}

function GameCard({ title='sample-title', img_path='imgs/ai.png' }) {
  return (
    <div className="game-card">
      <h2>{title }</h2>
      <img src={img_path} alt={title} />
    </div>
  );
}