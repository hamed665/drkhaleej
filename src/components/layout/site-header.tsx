import { Logo } from '@/components/brand/logo';
import { Container } from '@/components/ui/container';

export function SiteHeader() {
  return (
    <header className="site-header" role="banner">
      <Container className="site-header__inner">
        <div className="site-header__brand">
          <Logo />
        </div>
        <nav aria-label="Primary" className="site-header__nav">
          <ul>
            <li><span>Doctors</span></li>
            <li><span>Centers</span></li>
            <li><span>Services</span></li>
          </ul>
        </nav>
        <div className="site-header__locale" aria-label="Locale and country">
          <span>EN / AR · OM</span>
        </div>
      </Container>
    </header>
  );
}
