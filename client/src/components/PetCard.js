import React from 'react';
import { Link } from 'react-router-dom';
import './PetCard.css';

const PetCard = ({ pet }) => {
  const ageDisplay = pet.ageUnit === 'years' 
    ? `${pet.age} ${pet.age === 1 ? 'year' : 'years'}`
    : `${pet.age} ${pet.age === 1 ? 'month' : 'months'}`;

  return (
    <div className="pet-card">
      <Link to={`/pets/${pet._id}`} className="pet-card-link">
        <div className="pet-card-image">
          {pet.images && pet.images.length > 0 ? (
            <img src={pet.images[0]} alt={pet.name} />
          ) : (
            <div className="pet-card-placeholder">
              <span>🐾</span>
            </div>
          )}
          <span className={`pet-status pet-status-${pet.status.toLowerCase().replace(' ', '-')}`}>
            {pet.status}
          </span>
        </div>
        <div className="pet-card-info">
          <h3>{pet.name}</h3>
          <div className="pet-card-meta">
            <span>{pet.type}</span>
            <span>•</span>
            <span>{pet.breed || 'Mixed'}</span>
          </div>
          <div className="pet-card-details">
            <span>{ageDisplay}</span>
            <span>•</span>
            <span>{pet.gender}</span>
            <span>•</span>
            <span>{pet.size}</span>
          </div>
          {pet.location?.city && (
            <div className="pet-card-location">
              📍 {pet.location.city}, {pet.location.state}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default PetCard;

