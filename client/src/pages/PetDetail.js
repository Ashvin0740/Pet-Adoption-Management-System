import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { petsAPI, adoptionsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import './PetDetail.css';

const PetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    livingSituation: '',
    hasOtherPets: false,
    experienceWithPets: '',
    reasonForAdoption: '',
    agreeToTerms: false,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAdmin) {
      navigate('/admin');
      return;
    }
    fetchPet();
  }, [id, isAdmin, navigate]);
  
  if (isAdmin) {
    return null;
  }

  const fetchPet = async () => {
    try {
      const response = await petsAPI.getById(id);
      setPet(response.data);
    } catch (error) {
      console.error('Error fetching pet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.agreeToTerms) {
      setError('You must agree to the terms and conditions');
      return;
    }

    try {
      await adoptionsAPI.create({
        pet: id,
        applicantInfo: formData,
      });
      alert('Adoption application submitted successfully!');
      setShowForm(false);
      fetchPet();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit application');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!pet) {
    return <div className="error">Pet not found</div>;
  }

  const ageDisplay = pet.ageUnit === 'years' 
    ? `${pet.age} ${pet.age === 1 ? 'year' : 'years'}`
    : `${pet.age} ${pet.age === 1 ? 'month' : 'months'}`;

  return (
    <div className="pet-detail">
      <div className="container">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>

        <div className="pet-detail-content">
          <div className="pet-images">
            {pet.images && pet.images.length > 0 ? (
              <img src={pet.images[0]} alt={pet.name} />
            ) : (
              <div className="pet-image-placeholder">
                <span>🐾</span>
              </div>
            )}
          </div>

          <div className="pet-info">
            <div className="pet-header">
              <h1>{pet.name}</h1>
              <span className={`status-badge status-${pet.status.toLowerCase().replace(' ', '-')}`}>
                {pet.status}
              </span>
            </div>

            <div className="pet-meta">
              <div className="meta-item">
                <strong>Type:</strong> {pet.type}
              </div>
              <div className="meta-item">
                <strong>Breed:</strong> {pet.breed || 'Mixed'}
              </div>
              <div className="meta-item">
                <strong>Age:</strong> {ageDisplay}
              </div>
              <div className="meta-item">
                <strong>Gender:</strong> {pet.gender}
              </div>
              <div className="meta-item">
                <strong>Size:</strong> {pet.size}
              </div>
              {pet.color && (
                <div className="meta-item">
                  <strong>Color:</strong> {pet.color}
                </div>
              )}
              {pet.location?.city && (
                <div className="meta-item">
                  <strong>Location:</strong> {pet.location.city}, {pet.location.state}
                </div>
              )}
              {pet.adoptionFee > 0 && (
                <div className="meta-item">
                  <strong>Adoption Fee:</strong> ${pet.adoptionFee}
                </div>
              )}
            </div>

            <div className="pet-description">
              <h2>About</h2>
              <p>{pet.description}</p>
            </div>

            {pet.healthStatus && (
              <div className="pet-health">
                <h2>Health Information</h2>
                <div className="health-items">
                  <span className={pet.healthStatus.vaccinated ? 'health-check' : 'health-uncheck'}>
                    {pet.healthStatus.vaccinated ? '✓' : '✗'} Vaccinated
                  </span>
                  <span className={pet.healthStatus.spayedNeutered ? 'health-check' : 'health-uncheck'}>
                    {pet.healthStatus.spayedNeutered ? '✓' : '✗'} Spayed/Neutered
                  </span>
                </div>
                {pet.healthStatus.healthNotes && (
                  <p>{pet.healthStatus.healthNotes}</p>
                )}
              </div>
            )}

            {pet.specialNeeds && pet.specialNeeds.length > 0 && (
              <div className="pet-special-needs">
                <h2>Special Needs</h2>
                <ul>
                  {pet.specialNeeds.map((need, index) => (
                    <li key={index}>{need}</li>
                  ))}
                </ul>
              </div>
            )}

            {pet.status === 'Available' && (
              <div className="adoption-section">
                {isAuthenticated ? (
                  <>
                    {!showForm ? (
                      <button
                        onClick={() => setShowForm(true)}
                        className="btn btn-primary"
                      >
                        Apply for Adoption
                      </button>
                    ) : (
                      <form onSubmit={handleSubmit} className="adoption-form">
                        <h3>Adoption Application</h3>
                        {error && <div className="error-message">{error}</div>}

                        <div className="form-group">
                          <label>Living Situation</label>
                          <textarea
                            value={formData.livingSituation}
                            onChange={(e) => setFormData({ ...formData, livingSituation: e.target.value })}
                            required
                            rows="3"
                          />
                        </div>

                        <div className="form-group">
                          <label>
                            <input
                              type="checkbox"
                              checked={formData.hasOtherPets}
                              onChange={(e) => setFormData({ ...formData, hasOtherPets: e.target.checked })}
                            />
                            Do you have other pets?
                          </label>
                        </div>

                        <div className="form-group">
                          <label>Experience with Pets</label>
                          <textarea
                            value={formData.experienceWithPets}
                            onChange={(e) => setFormData({ ...formData, experienceWithPets: e.target.value })}
                            required
                            rows="3"
                          />
                        </div>

                        <div className="form-group">
                          <label>Reason for Adoption</label>
                          <textarea
                            value={formData.reasonForAdoption}
                            onChange={(e) => setFormData({ ...formData, reasonForAdoption: e.target.value })}
                            required
                            rows="3"
                          />
                        </div>

                        <div className="form-group">
                          <label>
                            <input
                              type="checkbox"
                              checked={formData.agreeToTerms}
                              onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                            />
                            I agree to the terms and conditions
                          </label>
                        </div>

                        <div className="form-actions">
                          <button type="submit" className="btn btn-primary">
                            Submit Application
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="btn btn-secondary"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </>
                ) : (
                  <div className="login-prompt">
                    <p>Please login to apply for adoption</p>
                    <button
                      onClick={() => navigate('/login')}
                      className="btn btn-primary"
                    >
                      Login
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetDetail;

