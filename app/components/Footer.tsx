import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="wordmark">
            <Image
              src="/logo.webp"
              alt=""
              width={40}
              height={40}
              className="wordmark-logo wordmark-logo-lg"
            />
            Chop&nbsp;It.
          </div>
          <div className="footer-tag">Weekly shop, sorted in minutes.</div>
        </div>
        <div className="footer-col">
          <div className="footer-col-h mono">PRODUCT</div>
          <span className="soon-link">This Week</span>
          <span className="soon-link">Shop</span>
          <span className="soon-link">Pantry</span>
          <span className="soon-link">Diversity Score</span>
          <span className="soon-link">
            Feasts <span className="tag-soon mono">Summer &rsquo;26</span>
          </span>
        </div>
        <div className="footer-col">
          <div className="footer-col-h mono">COMPANY</div>
          <span className="soon-link">Team</span>
          <span className="soon-link">Press</span>
          <span className="soon-link">Careers</span>
          <Link href="/blog">Blog</Link>
          <a href="mailto:hello@chop-it.com">Contact</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/data-deletion">Data deletion</a>
        </div>
        <div className="footer-col">
          <div className="footer-col-h mono">SOCIAL</div>
          <a href="https://www.tiktok.com/@chop_it" target="_blank" rel="noopener noreferrer">TikTok · @chop_it</a>
        </div>
      </div>
      <div className="footer-base">
        <span className="mono">© 2026 Chop It Ltd · chop-it.com</span>
        <span className="mono">Made for UK kitchens</span>
      </div>
    </footer>
  );
}
