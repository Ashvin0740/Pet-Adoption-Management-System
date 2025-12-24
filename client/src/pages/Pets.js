import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { petsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import PetCard from '../components/PetCard';
import './Pets.css';

const Pets = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    gender: '',
    size: '',
    status: 'Available',
    search: '',
    location: '',
    page: 1,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });

  const fetchPets = async () => {
    if (isAdmin) return;
    
    try {
      setLoading(true);
      const response = await petsAPI.getAll(filters);
      setPets(response.data.pets);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        total: response.data.total,
      });
    } catch (error) {
      console.error('Error fetching pets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      navigate('/admin');
      return;
    }
    fetchPets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, isAdmin, navigate]);
  
  if (isAdmin) {
    return null;
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value, page: 1 });
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
  };

  if (loading) {
    return <div className="loading">Loading pets...</div>;
  }

  return (
    <div className="pets-page">
      <div className="container">
        <h1>Browse Pets</h1>

        <div className="filters-section">
          <div className="filter-group">
            <input
              type="text"
              name="search"
              placeholder="Search by name, breed..."
              value={filters.search}
              onChange={handleFilterChange}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Types</option>
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
              <option value="Bird">Bird</option>
              <option value="Rabbit">Rabbit</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="filter-group">
            <select
              name="gender"
              value={filters.gender}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="filter-group">
            <select
              name="size"
              value={filters.size}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Sizes</option>
              <option value="Small">Small</option>
              <option value="Medium">Medium</option>
              <option value="Large">Large</option>
            </select>
          </div>

          <div className="filter-group">
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value="Available">Available</option>
              <option value="Pending">Pending</option>
              <option value="Adopted">Adopted</option>
            </select>
          </div>
        </div>

        <div className="results-info">
          Found {pagination.total} pet{pagination.total !== 1 ? 's' : ''}
        </div>

        {pets.length === 0 ? (
          <div className="no-results">
            <p>No pets found matching your criteria.</p>
          </div>
        ) : (
          <>
            <div className="pets-grid">
              {pets.map((pet) => (
                <PetCard key={pet._id} pet={pet} />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page === 1}
                  className="page-btn"
                >
                  Previous
                </button>
                <span>
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page === pagination.totalPages}
                  className="page-btn"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Pets;

