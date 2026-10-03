import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="home-page">
      {/* NAVBAR */}
      <header className="home-navbar">
        <Link to="/" className="home-brand">
          <span className="home-brand-mark">FR</span>

          <span>
            <strong>FoodRescue</strong>
            <small>Rescue food. Reduce waste.</small>
          </span>
        </Link>

        <nav className="home-nav">
          <a href="#how-it-works">How It Works</a>
          <a href="#impact">Our Impact</a>
          <Link to="/login" className="home-login">
            Login
          </Link>
          <Link to="/register" className="home-register">
            Get Started
          </Link>
        </nav>
      </header>

      {/* HERO */}
      <main>
        <section className="home-hero">
          <div className="hero-content">
            <div className="hero-eyebrow">
              <span></span>
              FOOD RECOVERY PLATFORM
            </div>

            <h1>
              Surplus food
              <br />
              <span>shouldn't become waste.</span>
            </h1>

            <p className="hero-description">
              FoodRescue connects food donors with NGOs so surplus food can
              reach people who need it — faster, smarter, and before it expires.
            </p>

            <div className="hero-actions">
              <Link to="/register" className="hero-primary">
                Start Rescuing Food
                <span>→</span>
              </Link>

              <a href="#how-it-works" className="hero-secondary">
                See how it works
              </a>
            </div>

            <div className="hero-trust">
              <div className="trust-item">
                <strong>Smart</strong>
                <span>Donation Matching</span>
              </div>

              <div className="trust-divider"></div>

              <div className="trust-item">
                <strong>Priority</strong>
                <span>Rescue Scoring</span>
              </div>

              <div className="trust-divider"></div>

              <div className="trust-item">
                <strong>Tracked</strong>
                <span>Food Pickups</span>
              </div>
            </div>
          </div>

          {/* HERO VISUAL */}
          <div className="hero-visual">
            <div className="hero-glow"></div>

            <div className="rescue-panel">
              <div className="rescue-panel-header">
                <div>
                  <span className="panel-label">LIVE RESCUE</span>
                  <h3>Food Recovery</h3>
                </div>

                <span className="live-status">
                  <span></span>
                  Active
                </span>
              </div>

              <div className="rescue-route">
                <div className="route-line">
                  <span className="route-dot donor-dot"></span>
                  <span></span>
                  <span className="route-dot ngo-dot"></span>
                </div>

                <div className="route-location">
                  <div>
                    <small>DONOR</small>
                    <strong>Local Restaurant</strong>
                  </div>

                  <div className="route-arrow">→</div>

                  <div className="route-location-right">
                    <small>RECEIVER</small>
                    <strong>Community NGO</strong>
                  </div>
                </div>
              </div>

              <div className="rescue-food">
                <div className="food-icon">FR</div>

                <div>
                  <small>AVAILABLE DONATION</small>
                  <strong>Fresh Prepared Meals</strong>
                  <span>25 portions · Available now</span>
                </div>

                <span className="priority-badge">86 / 100</span>
              </div>

              <div className="rescue-progress">
                <div className="progress-heading">
                  <span>Rescue priority</span>
                  <strong>High</strong>
                </div>

                <div className="progress-track">
                  <div className="progress-value"></div>
                </div>
              </div>

              <div className="rescue-footer">
                <span>Pickup coordination</span>
                <strong>Ready for rescue</strong>
              </div>
            </div>

            <div className="floating-card floating-card-top">
              <span className="floating-icon">+</span>

              <div>
                <strong>Food donated</strong>
                <small>Just now</small>
              </div>
            </div>

            <div className="floating-card floating-card-bottom">
              <div className="impact-number">25</div>

              <div>
                <strong>Meals rescued</strong>
                <small>From one donation</small>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="home-section how-section">
          <div className="section-heading">
            <span>HOW IT WORKS</span>
            <h2>From surplus to service.</h2>
            <p>
              FoodRescue creates a simple path from excess food to organizations
              that can put it to use.
            </p>
          </div>

          <div className="process-grid">
            <article className="process-card">
              <div className="process-number">01</div>

              <div className="process-line"></div>

              <h3>Donate</h3>

              <p>
                Restaurants, hotels, caterers and other food providers list
                surplus food with quantity, location and availability.
              </p>
            </article>

            <article className="process-card">
              <div className="process-number">02</div>

              <div className="process-line"></div>

              <h3>Match</h3>

              <p>
                Available donations are organized by availability, quantity and
                rescue priority so NGOs can find suitable food.
              </p>
            </article>

            <article className="process-card">
              <div className="process-number">03</div>

              <div className="process-line"></div>

              <h3>Rescue</h3>

              <p>
                NGOs request donations, coordinate pickups and complete the
                rescue process before food reaches its expiry.
              </p>
            </article>
          </div>
        </section>

        {/* IMPACT */}
        <section id="impact" className="home-section impact-section">
          <div className="impact-content">
            <div className="section-heading left">
              <span>WHY FOODRESCUE</span>
              <h2>Make every surplus meal count.</h2>
              <p>
                Food waste is not only about discarded food. It also means
                wasted resources, effort and opportunities to support local
                communities.
              </p>
            </div>

            <div className="impact-grid">
              <div className="impact-item">
                <strong>01</strong>
                <h3>Reduce waste</h3>
                <p>
                  Help food providers redirect usable surplus instead of letting
                  it go unused.
                </p>
              </div>

              <div className="impact-item">
                <strong>02</strong>
                <h3>Connect locally</h3>
                <p>
                  Bring donors and nearby community organizations into one
                  coordinated platform.
                </p>
              </div>

              <div className="impact-item">
                <strong>03</strong>
                <h3>Rescue faster</h3>
                <p>
                  Prioritize donations that need attention before their
                  availability window closes.
                </p>
              </div>

              <div className="impact-item">
                <strong>04</strong>
                <h3>Track operations</h3>
                <p>
                  Keep donation, pickup and recovery activity organized in one
                  system.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="home-cta">
          <div>
            <span>READY TO MAKE AN IMPACT?</span>

            <h2>
              Give surplus food
              <br />
              another destination.
            </h2>

            <p>
              Join FoodRescue as a donor or NGO and become part of a smarter
              food recovery network.
            </p>
          </div>

          <div className="cta-actions">
            <Link to="/register" className="cta-primary">
              Create Account
              <span>→</span>
            </Link>

            <Link to="/login" className="cta-secondary">
              Already have an account?
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="home-footer">
        <div className="footer-brand">
          <span className="home-brand-mark">FR</span>

          <div>
            <strong>FoodRescue</strong>
            <span>Technology for smarter food recovery.</span>
          </div>
        </div>

        <div className="footer-links">
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>

        <p>© {new Date().getFullYear()} FoodRescue</p>
      </footer>
    </div>
  );
}
