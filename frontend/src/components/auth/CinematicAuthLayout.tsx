import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import "./CinematicAuthLayout.css";

type Props = {
  children: ReactNode;
  page?: "login" | "register" | "owner" | "forgot";
  activeTab?: "login" | "register";
  showTabs?: boolean;
};

const photos = [
  {
    src: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=85",
    alt: "Wedding celebration",
    className: "auth-photo auth-photo-one",
  },
  {
    src: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=800&q=85",
    alt: "Wedding couple",
    className: "auth-photo auth-photo-two",
  },
  {
    src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=85",
    alt: "Wedding photography moment",
    className: "auth-photo auth-photo-three",
  },
  {
    src: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=700&q=85",
    alt: "Celebration detail",
    className: "auth-photo auth-photo-four",
  },
];

export default function CinematicAuthLayout({ children, page = "login", activeTab, showTabs = false }: Props) {
  return (
    <main className="cin-auth-page">
      <div className="cin-auth-backdrop" aria-hidden="true" />
      <header className="cin-auth-header">
        <Link to="/" className="cin-brand" aria-label="Brothers Photography home">
          <span className="cin-brand-mark" aria-hidden="true">◎</span>
          <span className="cin-brand-copy"><strong>BROTHERS</strong><small>PHOTOGRAPHY STUDIO</small></span>
        </Link>
        <p className="cin-header-tagline">CAPTURED WITH A STORY <i /></p>
        <Link to="/" className="cin-home-link">Home</Link>
      </header>

      <section className={`cin-auth-grid cin-auth-${page}`}>
        <aside className="cin-story-panel">
          <p className="cin-script">More than photography</p>
          <h1>We Capture<br />Your <span>Story.</span></h1>
          <p className="cin-story-caption">PEOPLE <b /> EMOTIONS <b /> MOMENTS <b /> FOREVER</p>
          <div className="cin-lens-art" aria-hidden="true"><span /><span /><span /></div>
        </aside>

        <section className="cin-form-card" aria-label="Account access">
          {showTabs && (
            <nav className="cin-auth-tabs" aria-label="Login or sign up">
              <Link className={activeTab === "login" ? "active" : ""} to="/login">Login</Link>
              <Link className={activeTab === "register" ? "active" : ""} to="/register">Sign Up</Link>
            </nav>
          )}
          {children}
        </section>

        <aside className="cin-gallery-panel" aria-label="Photography portfolio preview">
          <div className="cin-gallery-photos">
            {photos.map((photo) => <img key={photo.className} className={photo.className} src={photo.src} alt={photo.alt} loading="lazy" />)}
            <div className="cin-stats-card">
              <div><strong>500+</strong><small>Happy Clients</small></div>
              <div><strong>1200+</strong><small>Shoots</small></div>
              <div><strong>5<span>★</span></strong><small>Client Rating</small></div>
            </div>
          </div>
          <p className="cin-gallery-caption">Turning moments<br />into memories.</p>
        </aside>
      </section>
      <footer className="cin-auth-footer">BROTHERS PHOTOGRAPHY · PRIVATE CLIENT EXPERIENCE</footer>
    </main>
  );
}
