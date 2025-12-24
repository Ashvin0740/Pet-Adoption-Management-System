import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { petsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import './AddPet.css';

const AddPet = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    breed: '',
    age: '',
    ageUnit: 'months',
    gender: '',
    size: '',
    color: '',
    description: '',
    status: 'Available',
    location: {
      city: '',
      state: '',
      country: '',
    },
    healthStatus: {
      vaccinated: false,
      spayedNeutered: false,
      healthNotes: '',
    },
    specialNeeds: [],
    adoptionFee: 0,
    images: [],
  });
  const [newSpecialNeed, setNewSpecialNeed] = useState('');

  if (!isAuthenticated) {
    return (
      <div className="add-pet-page">
        <div className="container">
          <div className="login-prompt">
            <p>Please login to add a pet</p>
            <button
              onClick={() => navigate('/login')}
              className="btn btn-primary"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="add-pet-page">
        <div className="container">
          <div className="login-prompt">
            <p>Only administrators can add pets</p>
            <button
              onClick={() => navigate('/pets')}
              className="btn btn-primary"
            >
              Browse Pets
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          [locationField]: value,
        },
      });
    } else if (name.startsWith('healthStatus.')) {
      const healthField = name.split('.')[1];
      setFormData({
        ...formData,
        healthStatus: {
          ...formData.healthStatus,
          [healthField]: type === 'checkbox' ? checked : value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value,
      });
    }
  };

  const handleAddSpecialNeed = () => {
    if (newSpecialNeed.trim()) {
      setFormData({
        ...formData,
        specialNeeds: [...formData.specialNeeds, newSpecialNeed.trim()],
      });
      setNewSpecialNeed('');
    }
  };

  const handleRemoveSpecialNeed = (index) => {
    setFormData({
      ...formData,
      specialNeeds: formData.specialNeeds.filter((_, i) => i !== index),
    });
  };

  const handleImageUrl = (e) => {
    const url = e.target.value;
    if (url && !formData.images.includes(url)) {
      setFormData({
        ...formData,
        images: [...formData.images, url],
      });
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const petData = {
        ...formData,
        age: parseFloat(formData.age),
        adoptionFee: parseFloat(formData.adoptionFee) || 0,
      };

      const response = await petsAPI.create(petData);
      alert('Pet added successfully!');
      navigate(`/pets/${response.data._id}`);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.response?.data?.errors?.[0]?.msg ||
          'Failed to add pet'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-pet-page">
      <div className="container">
        <h1>Add a New Pet</h1>

        <form onSubmit={handleSubmit} className="add-pet-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-section">
            <h2>Basic Information</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Pet Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter pet name"
                />
              </div>

              <div className="form-group">
                <label>Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select type</option>
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                  <option value="Bird">Bird</option>
                  <option value="Rabbit">Rabbit</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Breed</label>
                <input
                  type="text"
                  name="breed"
                  value={formData.breed}
                  onChange={handleChange}
                  placeholder="e.g., Golden Retriever"
                />
              </div>

              <div className="form-group">
                <label>Age *</label>
                <div className="age-input-group">
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.1"
                    placeholder="Age"
                  />
                  <select
                    name="ageUnit"
                    value={formData.ageUnit}
                    onChange={handleChange}
                  >
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>

              <div className="form-group">
                <label>Size *</label>
                <select
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select size</option>
                  <option value="Small">Small</option>
                  <option value="Medium">Medium</option>
                  <option value="Large">Large</option>
                </select>
              </div>

              <div className="form-group">
                <label>Color</label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  placeholder="e.g., Brown, White"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="5"
                placeholder="Tell us about this pet..."
              />
            </div>

            <div className="form-group">
              <label>Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="Available">Available</option>
                <option value="Pending">Pending</option>
                <option value="Not Available">Not Available</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <h2>Location</h2>
            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleChange}
                  placeholder="City"
                />
              </div>

              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  name="location.state"
                  value={formData.location.state}
                  onChange={handleChange}
                  placeholder="State"
                />
              </div>

              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  name="location.country"
                  value={formData.location.country}
                  onChange={handleChange}
                  placeholder="Country"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Health Information</h2>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="healthStatus.vaccinated"
                  checked={formData.healthStatus.vaccinated}
                  onChange={handleChange}
                />
                Vaccinated
              </label>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="healthStatus.spayedNeutered"
                  checked={formData.healthStatus.spayedNeutered}
                  onChange={handleChange}
                />
                Spayed/Neutered
              </label>
            </div>

            <div className="form-group">
              <label>Health Notes</label>
              <textarea
                name="healthStatus.healthNotes"
                value={formData.healthStatus.healthNotes}
                onChange={handleChange}
                rows="3"
                placeholder="Any additional health information..."
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Special Needs</h2>
            <div className="form-group">
              <div className="special-needs-input">
                <input
                  type="text"
                  value={newSpecialNeed}
                  onChange={(e) => setNewSpecialNeed(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === 'Enter' &&
                    (e.preventDefault(), handleAddSpecialNeed())
                  }
                  placeholder="Enter special need"
                />
                <button
                  type="button"
                  onClick={handleAddSpecialNeed}
                  className="btn btn-secondary"
                >
                  Add
                </button>
              </div>
              {formData.specialNeeds.length > 0 && (
                <div className="special-needs-list">
                  {formData.specialNeeds.map((need, index) => (
                    <span key={index} className="special-need-tag">
                      {need}
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecialNeed(index)}
                        className="remove-btn"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-section">
            <h2>Images</h2>
            <div className="form-group">
              <label>Image URL</label>
              <div className="image-input-group">
                <input
                  type="url"
                  onBlur={handleImageUrl}
                  placeholder="Enter image URL and press Enter"
                  className="image-url-input"
                />
              </div>
              {formData.images.length > 0 && (
                <div className="images-preview">
                  {formData.images.map((url, index) => (
                    <div key={index} className="image-preview-item">
                      <img src={url} alt={`Preview ${index + 1}`} />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="remove-image-btn"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-section">
            <h2>Adoption Details</h2>
            <div className="form-group">
              <label>Adoption Fee ($)</label>
              <input
                type="number"
                name="adoptionFee"
                value={formData.adoptionFee}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Adding Pet...' : 'Add Pet'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/pets')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPet;
