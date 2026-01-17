import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer>
      <div className="footer-links">
        <Link href="/terms-and-conditions">Terms & Conditions</Link>
        <Link href="/privacy-policy">Privacy Policy</Link>
        <Link href="/about">About Us</Link>
        <Link href="/contact">Contact</Link>
      </div>
      <p>&copy; {currentYear} Nexenova Studios. All rights reserved.</p>
    </footer>
  );
}
