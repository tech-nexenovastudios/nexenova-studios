import Layout from '../components/Layout';

export default function About() {
  return (
    <Layout>
      <div className="about-content">
        <h1>About Nexenova Studios</h1>
        
        <section>
          <h2>Our Mission</h2>
          <p>
            Nexenova Studios is dedicated to crafting memorable gaming experiences 
            for global audiences. Our mission is to bring gaming to life with 
            innovation and fun, creating games that entertain, engage, and inspire 
            players of all ages.
          </p>
        </section>

        <section>
          <h2>Who We Are</h2>
          <p>
            We are a passionate game development studio specializing in mobile game 
            development. Our team is committed to creating high-quality games across 
            various genres, from puzzle games that challenge your mind to adventure 
            games that take you on epic journeys.
          </p>
          <p>
            Located in India, Nexenova Studios is a small but dedicated team of 
            developers, artists, and designers who work together to bring our 
            creative vision to life.
          </p>
        </section>

        <section>
          <h2>Our Games</h2>
          <p>
            We have published several games across different genres, including:
          </p>
          <ul style={{ marginLeft: '2rem', marginTop: '1rem', lineHeight: '2' }}>
            <li><strong>Pirate Tile-Clash</strong> - An exciting puzzle game with a pirate theme</li>
            <li><strong>2048 No Limit</strong> - A captivating puzzle game with endless challenges</li>
            <li><strong>Bird Hunter</strong> - An epic adventure game</li>
            <li><strong>Jump On</strong> - A fast-paced arcade game</li>
            <li><strong>Feed the Cat</strong> - A delightful casual game</li>
          </ul>
          <p style={{ marginTop: '1.5rem' }}>
            We also have exciting new games in development, including Ripple Delete 
            and Pirates Royale, which will be released soon.
          </p>
        </section>

        <section>
          <h2>Our Values</h2>
          <p>
            At Nexenova Studios, we believe in:
          </p>
          <ul style={{ marginLeft: '2rem', marginTop: '1rem', lineHeight: '2' }}>
            <li>Creating innovative and entertaining gameplay experiences</li>
            <li>Delivering high-quality games that players love</li>
            <li>Maintaining player trust through transparent communication</li>
            <li>Continuously improving and evolving our games</li>
          </ul>
        </section>

        <section>
          <h2>Join Us</h2>
          <p>
            Are you passionate about game development? We're always looking for 
            talented individuals to join our team. If you're interested in working 
            with us, please visit our <a href="/contact" style={{ color: '#667eea' }}>Contact</a> page 
            to get in touch.
          </p>
        </section>
      </div>
    </Layout>
  );
}
