import React, { useState, useEffect } from 'react';
import { petsAPI, adoptionsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

const Admin = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('applications');
  const [adoptions, setAdoptions] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchData();
  }, [isAdmin, navigate, activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'applications') {
        const response = await adoptionsAPI.getAll();
        setAdoptions(response.data);
      } else {
        const response = await petsAPI.getAll({});
        setPets(response.data.pets);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const notes = prompt('Enter notes (optional):') || '';
      await adoptionsAPI.updateStatus(id, status, notes);
      fetchData();
      alert('Status updated successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDeletePet = async (id) => {
    if (!window.confirm('Are you sure you want to delete this pet?')) {
      return;
    }

    try {
      await petsAPI.delete(id);
      fetchData();
      alert('Pet deleted successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete pet');
    }
  };

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-page">
      <div className="container">
        <h1>Admin Dashboard</h1>

        <div className="admin-tabs">
          <button
            className={activeTab === 'applications' ? 'active' : ''}
            onClick={() => setActiveTab('applications')}
          >
            Adoption Applications
          </button>
          <button
            className={activeTab === 'pets' ? 'active' : ''}
            onClick={() => setActiveTab('pets')}
          >
            Manage Pets
          </button>
        </div>

        {activeTab === 'applications' && (
          <div className="admin-section">
            <h2>Adoption Applications ({adoptions.length})</h2>
            {adoptions.length === 0 ? (
              <p>No applications found</p>
            ) : (
              <div className="applications-table">
                {adoptions.map((adoption) => (
                  <div key={adoption._id} className="application-row">
                    <div className="application-details">
                      <h3>{adoption.pet.name}</h3>
                      <p><strong>Applicant:</strong> {adoption.applicant.name} ({adoption.applicant.email})</p>
                      <p><strong>Applied:</strong> {new Date(adoption.applicationDate).toLocaleString()}</p>
                      <p><strong>Status:</strong> <span className={`status-${adoption.status.toLowerCase()}`}>{adoption.status}</span></p>
                      {adoption.applicantInfo && (
                        <div className="applicant-info">
                          <p><strong>Living Situation:</strong> {adoption.applicantInfo.livingSituation}</p>
                          <p><strong>Has Other Pets:</strong> {adoption.applicantInfo.hasOtherPets ? 'Yes' : 'No'}</p>
                          <p><strong>Experience:</strong> {adoption.applicantInfo.experienceWithPets}</p>
                        </div>
                      )}
                      {adoption.notes && <p><strong>Notes:</strong> {adoption.notes}</p>}
                    </div>
                    {adoption.status === 'Pending' && (
                      <div className="application-actions">
                        <button
                          onClick={() => handleStatusChange(adoption._id, 'Approved')}
                          className="btn btn-success"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusChange(adoption._id, 'Rejected')}
                          className="btn btn-danger"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'pets' && (
          <div className="admin-section">
            <h2>Manage Pets ({pets.length})</h2>
            {pets.length === 0 ? (
              <p>No pets found</p>
            ) : (
              <div className="pets-table">
                {pets.map((pet) => (
                  <div key={pet._id} className="pet-row">
                    <div className="pet-details">
                      <h3>{pet.name}</h3>
                      <p>{pet.type} - {pet.breed || 'Mixed'} | Status: <span className={`status-${pet.status.toLowerCase().replace(' ', '-')}`}>{pet.status}</span></p>
                      <p>Posted by: {pet.postedBy?.name || 'Unknown'}</p>
                    </div>
                    <div className="pet-actions">
                      <button
                        onClick={() => navigate(`/pets/${pet._id}`)}
                        className="btn btn-secondary"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDeletePet(pet._id)}
                        className="btn btn-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;

