import React, { useState, useEffect } from 'react';
import { usersAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      const userId = user._id || user.id;
      if (userId) {
        loadProfile();
      } else {
        console.error('User ID not available');
        setLoading(false);
      }
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const userId = user._id || user.id;
      if (!userId) {
        console.error('User ID not found');
        setLoading(false);
        return;
      }
      
      const response = await usersAPI.getById(userId);
      setProfileData({
        name: response.data.name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        address: response.data.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        },
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setProfileData({
        ...profileData,
        address: {
          ...profileData.address,
          [addressField]: value,
        },
      });
    } else {
      setProfileData({ ...profileData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const userId = user._id || user.id;
      if (!userId) {
        setMessage('User ID not found');
        setSaving(false);
        return;
      }
      
      await usersAPI.update(userId, profileData);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="profile-page">
      <div className="container">
        <h1>My Profile</h1>

        <form onSubmit={handleSubmit} className="profile-form">
          {message && (
            <div className={message.includes('success') ? 'success-message' : 'error-message'}>
              {message}
            </div>
          )}

          <div className="form-section">
            <h2>Personal Information</h2>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleChange}
                required
                disabled
              />
              <small>Email cannot be changed</small>
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={profileData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Address</h2>
            <div className="form-group">
              <label>Street</label>
              <input
                type="text"
                name="address.street"
                value={profileData.address.street}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="address.city"
                  value={profileData.address.city}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  name="address.state"
                  value={profileData.address.state}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Zip Code</label>
                <input
                  type="text"
                  name="address.zipCode"
                  value={profileData.address.zipCode}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  name="address.country"
                  value={profileData.address.country}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;

