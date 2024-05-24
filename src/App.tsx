// app.tsx
import React, { useEffect, useState } from 'react';
import socketIOClient from 'socket.io-client';
import 'bootswatch/dist/quartz/bootstrap.min.css';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import UserRegistration from './components/userRegistration';
import LoginForm from './components/loginForm';
import UserProfile from './components/getUserProfile';
import UpdateUserProfile from './components/updateUserProfile';
import AdminDashboard from './components/adminDashboard';
import './App.css';

const ENDPOINT =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_PROD_ENDPOINT || ''
    : process.env.REACT_APP_DEV_ENDPOINT || '';

interface Document {
  title: string;
  link: string;
  pageLocation: string;
  // Add other document properties as need
}

const App: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  };
  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);

    checkAuthStatus();

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError('Failed to connect to the server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setError('Disconnected from the server');
    });

    socket.on('initialDocuments', (initialDocuments: Document[]) => {
      if (Array.isArray(initialDocuments)) {
        setDocuments(initialDocuments);
      } else {
        console.error('Invalid initialDocuments data:', initialDocuments);
      }
    });

    socket.on('updateDocuments', (updatedDocuments: Document[]) => {
      if (Array.isArray(updatedDocuments)) {
        setDocuments(updatedDocuments);
      } else {
        console.error('Invalid updatedDocuments data:', updatedDocuments);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    // Redirect to the login page or home page
    window.location.href = '/';
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  const pageLocationOrder = [
    'Headline',
    'topLeft',
    'column1',
    'column2',
    'column3',
  ];

  // Sort the documents based on the defined page location order
  const sortedDocuments = [...documents].sort((a, b) => {
    const indexA = pageLocationOrder.indexOf(a.pageLocation);
    const indexB = pageLocationOrder.indexOf(b.pageLocation);
    return indexA - indexB;
  });

  return (
    <Router>
      <div>
        <nav>
          <ul id="list">
            <li className="items">
              <Link to="/">Home</Link>
            </li>
            {!isAuthenticated && (
              <>
                <li className="items">
                  <Link to="/login">Login</Link>
                </li>
                <li className="items">
                  <Link to="/register">Register</Link>
                </li>
              </>
            )}
            {isAuthenticated && (
              <>
                <li className="items">
                  <Link to="/profile">Profile</Link>
                </li>
                <li className="items">
                  <Link to="/update-profile">Update Profile</Link>
                </li>
                <li className="items">
                  <Link to="/admin-dashboard">Admin Dashboard</Link>
                </li>
                <li className="items">
                  <Link to="/" onClick={handleLogout}>
                    Logout
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        <Routes>
          <Route
            path="/"
            element={
              <div id="bg">
                <h1 id="title">
                  Drudge <span id="reader">Reader</span>
                </h1>
                <div>
                  <h3 id="cta" className="glowing-text">
                    The Latest Stories
                  </h3>
                  <ul className="list">
                    {sortedDocuments.map((document, index) => (
                      <li key={index}>
                        <a
                          href={document.link}
                          dangerouslySetInnerHTML={{ __html: document.link }}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            }
          />
          <Route path="/register" element={<UserRegistration />} />
          <Route
            path="/login"
            element={<LoginForm setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/update-profile" element={<UpdateUserProfile />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
