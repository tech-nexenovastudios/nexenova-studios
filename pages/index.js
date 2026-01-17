import Layout from '../components/Layout';
import GameCard from '../components/GameCard';
import gamesData from '../data/games.json';

export default function Home() {
  const releasedGames = gamesData.filter(game => game.status === 'released');
  const comingSoonGames = gamesData.filter(game => game.status === 'coming-soon');

  return (
    <Layout>
      <div className="hero">
        <h1>Bringing Gaming to Life with Innovation and Fun</h1>
        <p>Crafting Memorable Gaming Experiences for Global Audiences</p>
      </div>

      <section className="section">
        <h2>Featured Games</h2>
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

      <section className="section">
        <h2>About Nexenova Studios</h2>
        <p>
          Nexenova Studios is a passionate game development studio dedicated to creating 
          innovative and entertaining mobile games. Our mission is to bring joy and 
          excitement to players around the world through engaging gameplay experiences.
        </p>
        <p>
          From puzzle games that challenge your mind to adventure games that take you 
          on epic journeys, we strive to deliver high-quality games that players love 
          to play and share with friends.
        </p>
      </section>
    </Layout>
  );
}
