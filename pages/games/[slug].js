import Layout from '../../components/Layout';
import gamesData from '../../data/games.json';
import { useRouter } from 'next/router';

export default function GameDetail() {
  const router = useRouter();
  const { slug } = router.query;

  if (!slug) {
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );
  }

  const game = gamesData.find(g => g.slug === slug);

  if (!game) {
    return (
      <Layout>
        <div>
          <h1>Game Not Found</h1>
          <p>The game you're looking for doesn't exist.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="game-detail">
        <h1>{game.title}</h1>
        <div className="game-meta">
          <span className="genre" style={{ background: '#f0f0f0', padding: '0.5rem 1rem', borderRadius: '20px' }}>
            {game.category}
          </span>
          <span className={`status-badge ${game.status}`}>
            {game.status === 'released' ? 'Available Now' : 'Coming Soon'}
          </span>
          {game.platforms && (
            <span style={{ background: '#e3f2fd', padding: '0.5rem 1rem', borderRadius: '20px', color: '#1976d2' }}>
              {game.platforms.join(', ')}
            </span>
          )}
        </div>
        <div className="game-description">
          <p>{game.description}</p>
        </div>
        {game.status === 'released' && (
          <div style={{ marginTop: '2rem' }}>
            <p style={{ marginBottom: '1rem', color: '#666' }}>
              Available on {game.platforms?.join(' and ') || 'mobile platforms'}. 
              Download now from your app store!
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
