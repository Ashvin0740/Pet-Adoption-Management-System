import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={`navbar ${isAdmin ? 'navbar-admin' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🐾 Pet Adoption
          {isAdmin && <span className="admin-badge">ADMIN</span>}
        </Link>
        <ul className="navbar-menu">
          <li>
            <Link to="/" className="navbar-link">
              Home
            </Link>
          </li>
          {!isAdmin && (
            <li>
              <Link to="/pets" className="navbar-link">
                Browse Pets
              </Link>
            </li>
          )}
          {user ? (
            <>
              {isAdmin ? (
                <>
                  <li>
                    <Link to="/add-pet" className="navbar-link">
                      Add Pet
                    </Link>
                  </li>
                  <li>
                    <Link to="/my-pets" className="navbar-link">
                      My Pets
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin" className="navbar-link">
                      Admin Dashboard
                    </Link>
                  </li>
                </>
              ) : (
                <li>
                  <Link to="/my-applications" className="navbar-link">
                    My Applications
                  </Link>
                </li>
              )}
              <li>
                <Link to="/profile" className="navbar-link">
                  Profile
                </Link>
              </li>
              <li>
                <button onClick={handleLogout} className="navbar-button">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className="navbar-link">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="navbar-button">
                  Sign Up
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

