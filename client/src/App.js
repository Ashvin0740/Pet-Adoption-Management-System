import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Pets from './pages/Pets';
import PetDetail from './pages/PetDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import AddPet from './pages/AddPet';
import EditPet from './pages/EditPet';
import MyPets from './pages/MyPets';
import MyApplications from './pages/MyApplications';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

const AppContent = () => {
  const { isAdmin } = useAuth();
  
  return (
    <div className={`App ${isAdmin ? 'app-admin' : ''}`}>
      <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pets" element={<Pets />} />
            <Route path="/pets/:id" element={<PetDetail />} />
            <Route
              path="/pets/:id/edit"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <EditPet />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/add-pet"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AddPet />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-pets"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <MyPets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-applications"
              element={
                <ProtectedRoute>
                  <MyApplications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
  );
}

export default App;
