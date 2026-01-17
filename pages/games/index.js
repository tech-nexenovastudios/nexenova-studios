import Layout from '../../components/Layout';
import GameCard from '../../components/GameCard';
import gamesData from '../../data/games.json';

export default function Games() {
  const releasedGames = gamesData.filter(game => game.status === 'released');
  const comingSoonGames = gamesData.filter(game => game.status === 'coming-soon');

  return (
    <Layout>
      <h1>All Games</h1>
      <p style={{ marginBottom: '2rem', fontSize: '1.1rem', color: '#666' }}>
        Explore our collection of games across various genres and platforms.
      </p>

      <section className="section">
        <h2>Available Now</h2>
        <div className="games-grid">
          {releasedGames.map(game => (
            <GameCard key={game.slug} game={game} />
          ))}
        </div>
      </section>

      {comingSoonGames.length > 0 && (
        <section className="section coming-soon-section">
          <h2>Coming Soon</h2>
          <div className="games-grid">
            {comingSoonGames.map(game => (
              <GameCard key={game.slug} game={game} />
            ))}
          </div>
        </section>
      )}
    </Layout>
  );
}
