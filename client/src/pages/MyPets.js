import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { petsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import PetCard from '../components/PetCard';
import './MyPets.css';

const MyPets = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchMyPets();
    }
  }, [isAuthenticated, isAdmin]);

  const fetchMyPets = async () => {
    try {
      const userId = user?._id || user?.id;
      if (!userId) {
        console.error('User ID not available');
        setLoading(false);
        return;
      }
      // Fetch pets posted by current user
      const response = await petsAPI.getAll({ postedBy: userId });
      setPets(response.data.pets);
    } catch (error) {
      console.error('Error fetching pets:', error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this pet?')) {
      return;
    }

    try {
      await petsAPI.delete(id);
      setPets(pets.filter(pet => pet._id !== id));
      alert('Pet deleted successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete pet');
    }
  };

  const handleEdit = (id) => {
    navigate(`/pets/${id}/edit`);
  };

  if (!isAuthenticated) {
    return (
      <div className="my-pets-page">
        <div className="container">
          <div className="login-prompt">
            <p>Please login to view your pets</p>
            <button onClick={() => navigate('/login')} className="btn btn-primary">
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="my-pets-page">
        <div className="container">
          <div className="login-prompt">
            <p>Only administrators can manage pets</p>
            <button onClick={() => navigate('/pets')} className="btn btn-primary">
              Browse Pets
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading your pets...</div>;
  }

  return (
    <div className="my-pets-page">
      <div className="container">
        <div className="my-pets-header">
          <h1>My Pets</h1>
          <Link to="/add-pet" className="btn btn-primary">
            + Add New Pet
          </Link>
        </div>

        {pets.length === 0 ? (
          <div className="no-pets">
            <p>You haven't posted any pets yet.</p>
            <Link to="/add-pet" className="btn btn-primary">
              Add Your First Pet
            </Link>
          </div>
        ) : (
          <>
            <div className="pets-grid">
              {pets.map((pet) => (
                <div key={pet._id} className="pet-card-wrapper">
                  <PetCard pet={pet} />
                  <div className="pet-actions">
                    <button
                      onClick={() => handleEdit(pet._id)}
                      className="btn btn-secondary btn-small"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(pet._id)}
                      className="btn btn-danger btn-small"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyPets;

