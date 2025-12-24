import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <div className={`home ${isAdmin ? 'home-admin' : ''}`}>
      <section className={`hero ${isAdmin ? 'hero-admin' : ''}`}>
        <div className="hero-content">
          <h1>{isAdmin ? 'Admin Dashboard' : 'Find Your Perfect Companion'}</h1>
          <p>{isAdmin ? 'Manage pets and review adoption applications' : 'Join thousands of happy families who found their furry friends through our adoption platform'}</p>
          <div className="hero-buttons">
            {isAdmin ? (
              <>
                <Link to="/admin" className="btn btn-primary">
                  Go to Dashboard
                </Link>
                <Link to="/add-pet" className="btn btn-secondary">
                  Add New Pet
                </Link>
              </>
            ) : (
              <>
                <Link to="/pets" className="btn btn-primary">
                  Browse Pets
                </Link>
                {isAuthenticated ? (
                  <Link to="/pets" className="btn btn-secondary">
                    View Pets
                  </Link>
                ) : (
                  <Link to="/register" className="btn btn-secondary">
                    Get Started
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>Why Choose Us?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🐕</div>
              <h3>Wide Selection</h3>
              <p>Browse through hundreds of pets looking for loving homes</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">❤️</div>
              <h3>Easy Process</h3>
              <p>Simple and straightforward adoption application process</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏥</div>
              <h3>Health Checked</h3>
              <p>All pets are health-checked and vaccinated</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤝</div>
              <h3>Support</h3>
              <p>Ongoing support throughout the adoption process</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

