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
import ScheduleMeeting from './pages/ScheduleMeeting';
import Reviews from './pages/Reviews';
import Leaderboard from './pages/Leaderboard';
import Credits from './pages/Credits';
import SwapRoom from './pages/SwapRoom';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const res = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to authenticate');
      }

      const data = await res.json();
      setUser(data);
      return data;
    } catch (err) {
      console.error(err);
      localStorage.removeItem('token');
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    const initializeUser = async () => {
      setLoading(true);
      await fetchUserProfile();
      setLoading(false);
    };

    initializeUser();
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
          <Route path="/register" element={<Register setUser={setUser} refreshUser={fetchUserProfile} />} />
          <Route path="/login" element={<Login setUser={setUser} refreshUser={fetchUserProfile} />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute user={user}>
                <Dashboard user={user} refreshUser={fetchUserProfile} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute user={user}>
                <Profile user={user} setUser={setUser} refreshUser={fetchUserProfile} />
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
                <SwapRequests user={user} refreshUser={fetchUserProfile} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/schedule-meeting/:swapId" 
            element={
              <ProtectedRoute user={user}>
                <ScheduleMeeting user={user} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reviews" 
            element={
              <ProtectedRoute user={user}>
                <Reviews user={user} refreshUser={fetchUserProfile} />
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
                <Credits user={user} refreshUser={fetchUserProfile} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/swap-room/:id" 
            element={
              <ProtectedRoute user={user}>
                <SwapRoom user={user} />
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