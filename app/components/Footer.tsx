import Image from 'next/image';

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
          <a href="#">This Week</a>
          <a href="#">Shop</a>
          <a href="#">Pantry</a>
          <a href="#">Diversity Score</a>
          <a href="#">
            Feasts <span className="tag-soon mono">Summer &rsquo;26</span>
          </a>
        </div>
        <div className="footer-col">
          <div className="footer-col-h mono">COMPANY</div>
          <a href="#">Team</a>
          <a href="#">Press</a>
          <a href="#">Careers</a>
          <a href="mailto:secretary@chop-it.com">Contact</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/data-deletion">Data deletion</a>
        </div>
        <div className="footer-col">
          <div className="footer-col-h mono">SOCIAL</div>
          <a href="#">TikTok · @chopit</a>
          <a href="#">Instagram · @chopit.app</a>
          <a href="#">X · @chopit.app</a>
        </div>
      </div>
      <div className="footer-base">
        <span className="mono">© 2026 Chop It Ltd · chop-it.com</span>
        <span className="mono">Made for UK kitchens</span>
      </div>
    </footer>
  );
}
