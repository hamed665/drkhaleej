import { Container } from '@/components/ui/container';

export function SiteFooter() {
  return (
    <footer className="site-footer" role="contentinfo">
      <Container className="site-footer__inner">
        <div className="site-footer__brand">
          <strong>DrMuscat</strong>
          <p>Trusted healthcare discovery foundation for Oman.</p>
        </div>
        <div className="site-footer__links" aria-label="Footer placeholders">
          <p>Doctors · Centers · Services</p>
          <p>Privacy · Terms · Contact</p>
        </div>
      </Container>
    </footer>
  );
}
