import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  useEffect(() => {
    const revealElements = document.querySelectorAll(".home-reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("home-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
      },
    );

    revealElements.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="home-page">
      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="home-header">
        <div className="home-header-inner">
          <Link to="/" className="home-logo">
            <span className="home-logo-mark">FR</span>

            <span className="home-logo-text">FoodRescue</span>
          </Link>

          <nav className="home-navigation">
            <a href="#how-it-works">How It Works</a>

            <a href="#impact">Our Impact</a>

            <a href="#roles">For Organizations</a>

            <Link to="/login" className="home-nav-login">
              Login
            </Link>

            <Link to="/register" className="home-nav-register">
              Get Started
            </Link>
          </nav>

          <button
            type="button"
            className="home-mobile-button"
            aria-label="Open navigation"
          >
            ☰
          </button>
        </div>
      </header>

      {/* =====================================================
          HERO
          ===================================================== */}

      <section className="home-hero">
        <div className="hero-container">
          <div className="hero-copy home-reveal">
            <div className="hero-kicker">FOOD WASTE REDUCTION PLATFORM</div>

            <h1>
              Good food deserves
              <span> a second chance.</span>
            </h1>

            <p>
              FoodRescue connects organizations with surplus food to trusted
              NGOs, helping good food reach people instead of becoming waste.
            </p>

            <div className="hero-buttons">
              <Link to="/register" className="hero-primary-button">
                Start Rescuing Food
              </Link>

              <a href="#how-it-works" className="hero-secondary-button">
                See How It Works
              </a>
            </div>
          </div>

          <div className="hero-image-area home-reveal">
            <div className="hero-image-frame">
              <img
                src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1400&q=85"
                alt="Fresh food prepared for sharing"
              />
            </div>

            <div className="hero-floating-card hero-status-card">
              <span className="hero-status-label">RESCUE STATUS</span>

              <div className="hero-status-main">
                <span className="hero-status-dot" />
                Food rescued
              </div>
            </div>

            <div className="hero-floating-card hero-priority-card">
              <span className="priority-label">RESCUE PRIORITY</span>

              <span className="priority-value">HIGH</span>

              <div className="priority-subtext">Ready for matching</div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          TRUST STRIP
          ===================================================== */}

      <section className="home-trust-strip">
        <div className="trust-items">
          <div className="trust-item">
            <span className="trust-number">Smart</span>

            <span className="trust-label">Donation Matching</span>
          </div>

          <div className="trust-item">
            <span className="trust-number">Real-time</span>

            <span className="trust-label">Availability Tracking</span>
          </div>

          <div className="trust-item">
            <span className="trust-number">Priority</span>

            <span className="trust-label">Rescue Scoring</span>
          </div>

          <div className="trust-item">
            <span className="trust-number">Connected</span>

            <span className="trust-label">Donors & NGOs</span>
          </div>
        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS
          ===================================================== */}

      <section id="how-it-works" className="home-section">
        <div className="home-container">
          <div className="section-intro home-reveal">
            <div className="section-eyebrow">HOW FOODRESCUE WORKS</div>

            <h2>From surplus food to meaningful impact.</h2>

            <p>
              FoodRescue creates a simple connection between food providers and
              organizations that can put surplus food to meaningful use.
            </p>
          </div>

          <div className="workflow">
            <article className="workflow-card home-reveal">
              <div className="workflow-number">01</div>

              <h3>List surplus food</h3>

              <p>
                Donors add available food, quantity, pickup information and the
                time window in which it can be rescued.
              </p>
            </article>

            <article className="workflow-card home-reveal">
              <div className="workflow-number">02</div>

              <h3>Find the right match</h3>

              <p>
                NGOs can discover suitable donations using availability,
                location, quantity and rescue-priority information.
              </p>
            </article>

            <article className="workflow-card home-reveal">
              <div className="workflow-number">03</div>

              <h3>Rescue & complete pickup</h3>

              <p>
                Pickup requests connect both sides and provide a clear process
                from acceptance to completed food rescue.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* =====================================================
          STORY SECTION
          ===================================================== */}

      <section className="home-story-section">
        <div className="story-grid">
          <div className="story-image home-reveal">
            <img
              src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1200&q=85"
              alt="Fresh produce that can be rescued"
            />
          </div>

          <div className="story-copy home-reveal">
            <div className="section-eyebrow">WHY IT MATTERS</div>

            <h2>Food can lose its value long before it loses its worth.</h2>

            <p>
              Restaurants, hotels, caterers and other organizations can have
              safe surplus food that simply does not have a destination.
              FoodRescue provides the connection needed to move that food toward
              people and communities who can use it.
            </p>

            <div className="story-points">
              <div className="story-point">
                <div className="story-point-icon">✓</div>

                <div className="story-point-text">
                  <strong>Reduce avoidable food waste</strong>

                  <span>
                    Give usable surplus food another opportunity before it
                    becomes waste.
                  </span>
                </div>
              </div>

              <div className="story-point">
                <div className="story-point-icon">✓</div>

                <div className="story-point-text">
                  <strong>Make discovery easier</strong>

                  <span>
                    Help NGOs find donations based on practical information and
                    urgency.
                  </span>
                </div>
              </div>

              <div className="story-point">
                <div className="story-point-icon">✓</div>

                <div className="story-point-text">
                  <strong>Create accountable pickups</strong>

                  <span>
                    Keep donation and pickup activity visible throughout the
                    rescue process.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          ROLES
          ===================================================== */}

      <section id="roles" className="roles-section">
        <div className="home-container">
          <div className="section-intro home-reveal">
            <div className="section-eyebrow">BUILT FOR BOTH SIDES</div>

            <h2>One platform. Two essential roles.</h2>

            <p>
              FoodRescue gives donors and NGOs the tools they need to make food
              rescue practical, organized and traceable.
            </p>
          </div>

          <div className="roles-grid">
            <article className="role-panel home-reveal">
              <span className="role-tag">FOR DONORS</span>

              <h3>Turn surplus into opportunity.</h3>

              <p>
                Restaurants, hotels, caterers and other food providers can
                publish available surplus food and manage requests and pickups
                from one place.
              </p>

              <Link to="/register" className="role-link">
                Become a donor →
              </Link>
            </article>

            <article className="role-panel ngo-panel home-reveal">
              <span className="role-tag">FOR NGOs</span>

              <h3>Discover food worth rescuing.</h3>

              <p>
                NGOs can find available donations, review important rescue
                information, request food and coordinate pickups with donors.
              </p>

              <Link to="/register" className="role-link">
                Register as an NGO →
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* =====================================================
          IMPACT
          ===================================================== */}

      <section id="impact" className="home-impact">
        <div className="impact-container">
          <div className="impact-heading home-reveal">
            <div className="section-eyebrow">THE BIGGER PICTURE</div>

            <h2>Small rescue decisions can create a larger impact.</h2>

            <p>
              FoodRescue is designed to make the journey from surplus to rescue
              easier to coordinate and easier to understand.
            </p>
          </div>

          <div className="impact-metrics home-reveal">
            <div className="impact-metric">
              <strong>01</strong>

              <span>
                Donation is created and becomes visible to eligible NGOs.
              </span>
            </div>

            <div className="impact-metric">
              <strong>02</strong>

              <span>
                A suitable NGO discovers and requests the available food.
              </span>
            </div>

            <div className="impact-metric">
              <strong>03</strong>

              <span>Pickup coordination completes the rescue journey.</span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
          ===================================================== */}

      <section className="home-final-cta">
        <div className="final-cta-inner home-reveal">
          <div className="section-eyebrow">READY TO MAKE A DIFFERENCE?</div>

          <h2>Give surplus food somewhere to go.</h2>

          <p>
            Join FoodRescue and become part of a connected system built to
            reduce food waste and make food rescue easier.
          </p>

          <div className="final-cta-buttons">
            <Link to="/register" className="final-cta-primary">
              Create an Account
            </Link>

            <Link to="/login" className="final-cta-secondary">
              Already registered? Login
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
          ===================================================== */}

      <footer className="home-footer">
        <div className="footer-main">
          <div className="footer-brand">
            <Link to="/" className="home-logo">
              <span className="home-logo-mark">FR</span>

              <span className="home-logo-text" style={{ color: "white" }}>
                FoodRescue
              </span>
            </Link>

            <p>
              A food-waste reduction platform connecting surplus food with
              organizations working to rescue and redistribute it.
            </p>
          </div>

          <div className="footer-column">
            <h4>Platform</h4>

            <a href="#how-it-works">How It Works</a>

            <a href="#impact">Our Impact</a>

            <a href="#roles">For Organizations</a>
          </div>

          <div className="footer-column">
            <h4>Account</h4>

            <Link to="/login">Login</Link>

            <Link to="/register">Register</Link>
          </div>

          <div className="footer-column">
            <h4>FoodRescue</h4>

            <a href="#how-it-works">About</a>

            <a href="#impact">Sustainability</a>

            <a href="#roles">Get Involved</a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} FoodRescue</span>

          <span>Built to help good food go further.</span>
        </div>
      </footer>
    </div>
  );
}
