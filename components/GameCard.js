import Link from 'next/link';

export default function GameCard({ game }) {
  return (
    <div className="game-card">
      <h3>{game.title}</h3>
      <span className="genre">{game.category}</span>
      <p className="description">{game.description}</p>
      <span className={`status-badge ${game.status}`}>
        {game.status === 'released' ? 'Available Now' : 'Coming Soon'}
      </span>
      <br />
      {game.status === 'released' && (
        <Link href={`/games/${game.slug}`} className="learn-more">
          Learn More
        </Link>
      )}
    </div>
  );
}
