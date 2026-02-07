import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Skills from './pages/Skills';
import SwapRequests from './pages/SwapRequests';
import Reviews from './pages/Reviews';
import Leaderboard from './pages/Leaderboard';
import Credits from './pages/Credits';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('Failed to authenticate');
        }
      })
      .then(data => {
        setUser(data);
      })
      .catch(err => {
        console.error(err);
        localStorage.removeItem('token');
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="App">
      <Navbar user={user} logout={logout} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute user={user}>
                <Dashboard user={user} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute user={user}>
                <Profile user={user} setUser={setUser} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/skills" 
            element={
              <ProtectedRoute user={user}>
                <Skills user={user} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/swap-requests" 
            element={
              <ProtectedRoute user={user}>
                <SwapRequests user={user} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reviews" 
            element={
              <ProtectedRoute user={user}>
                <Reviews user={user} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/leaderboard" 
            element={
              <ProtectedRoute user={user}>
                <Leaderboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/credits" 
            element={
              <ProtectedRoute user={user}>
                <Credits user={user} />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;