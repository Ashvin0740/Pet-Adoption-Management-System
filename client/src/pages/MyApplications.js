import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adoptionsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import './MyApplications.css';

const MyApplications = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [adoptions, setAdoptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      navigate('/admin');
      return;
    }
    fetchApplications();
  }, [isAdmin, navigate]);
  
  if (isAdmin) {
    return null;
  }

  const fetchApplications = async () => {
    try {
      const response = await adoptionsAPI.getAll();
      setAdoptions(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this application?')) {
      return;
    }

    try {
      await adoptionsAPI.cancel(id);
      fetchApplications();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel application');
    }
  };

  if (loading) {
    return <div className="loading">Loading applications...</div>;
  }

  return (
    <div className="my-applications">
      <div className="container">
        <h1>My Adoption Applications</h1>

        {adoptions.length === 0 ? (
          <div className="no-applications">
            <p>You haven't submitted any adoption applications yet.</p>
            <Link to="/pets" className="btn btn-primary">
              Browse Pets
            </Link>
          </div>
        ) : (
          <div className="applications-list">
            {adoptions.map((adoption) => (
              <div key={adoption._id} className="application-card">
                <div className="application-header">
                  <Link to={`/pets/${adoption.pet._id}`} className="pet-link">
                    <h3>{adoption.pet.name}</h3>
                  </Link>
                  <span className={`status-badge status-${adoption.status.toLowerCase()}`}>
                    {adoption.status}
                  </span>
                </div>

                <div className="application-info">
                  <p><strong>Applied on:</strong> {new Date(adoption.applicationDate).toLocaleDateString()}</p>
                  <p><strong>Pet Type:</strong> {adoption.pet.type} - {adoption.pet.breed || 'Mixed'}</p>
                  {adoption.reviewDate && (
                    <p><strong>Reviewed on:</strong> {new Date(adoption.reviewDate).toLocaleDateString()}</p>
                  )}
                  {adoption.notes && (
                    <div className="application-notes">
                      <strong>Notes:</strong>
                      <p>{adoption.notes}</p>
                    </div>
                  )}
                </div>

                {adoption.status === 'Pending' && (
                  <button
                    onClick={() => handleCancel(adoption._id)}
                    className="btn btn-secondary btn-small"
                  >
                    Cancel Application
                  </button>
                )}

                <Link to={`/pets/${adoption.pet._id}`} className="view-pet-link">
                  View Pet Details →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;

