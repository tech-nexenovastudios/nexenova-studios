import Layout from '../components/Layout';

export default function Contact() {
  return (
    <Layout>
      <div className="contact-form">
        <h1>Contact Us</h1>
        <p style={{ marginBottom: '2rem', color: '#666' }}>
          Have questions, feedback, or want to work with us? We'd love to hear from you!
        </p>

        <form>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input type="text" id="name" name="name" required />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" required />
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input type="text" id="subject" name="subject" required />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea id="message" name="message" required></textarea>
          </div>

          <button type="submit" className="submit-btn">Send Message</button>
        </form>

        <div style={{ marginTop: '3rem', padding: '2rem', background: '#f5f5f5', borderRadius: '8px' }}>
          <h2 style={{ marginBottom: '1rem' }}>Other Ways to Reach Us</h2>
          <p style={{ marginBottom: '0.5rem' }}>
            <strong>Email:</strong> com.nexenovastudios.piratetileclash.in
          </p>
          <p style={{ marginBottom: '0.5rem' }}>
            <strong>General Inquiries:</strong> For questions about our games, privacy policy, 
            or terms and conditions, please refer to the respective pages on this website.
          </p>
        </div>
      </div>
    </Layout>
  );
}
