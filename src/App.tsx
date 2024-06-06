// app.tsx
import React, { useEffect, useState } from 'react';
import socketIOClient from 'socket.io-client';
import 'bootswatch/dist/quartz/bootstrap.min.css';
import {
  BrowserRouter as Router,
  Route,
  Link,
  Routes,
  useNavigate,
} from 'react-router-dom';
import UserRegistration from './components/userRegistration';
import LoginForm from './components/loginForm';
import UserProfile from './components/getUserProfile';
import UpdateUserProfile from './components/updateUserProfile';
import AdminDashboard from './components/adminDashboard';
import PasswordResetRequestForm from './components/PasswordResetRequestForm';
import ResetPassword from './components/ResetPassword';
import './App.css';
import { jwtDecode } from 'jwt-decode';

const ENDPOINT =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_PROD_ENDPOINT || ''
    : process.env.REACT_APP_DEV_ENDPOINT || '';

interface Document {
  title: string;
  link: string;
  pageLocation: string;
  // Add other document properties as needed
}

interface DecodedToken {
  role: string;
  // Add other token properties as needed
}

const App: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);

    if (token) {
      const decodedToken: DecodedToken = jwtDecode(token);
      setIsAdmin(decodedToken.role === 'ADMIN');
    } else {
      setIsAdmin(false);
    }
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
    setIsAdmin(false);
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

  interface DiscussionAttributes {
    title: string;
    // Add other relevant attributes here
  }

  interface Discussion {
    id: string; // Assuming each discussion has a unique identifier
    attributes: DiscussionAttributes;
    // Include any other relevant fields that might be needed
  }
  interface ApiResponse {
    data: Discussion[];
    // Add other relevant response properties here if applicable
  }

  // handleClick checks if discussion exists and takes you there,
  // otherwise it starts a new discussion
  const handleClick = async (
    e: React.MouseEvent,
    apiUrl: string,
    exactTitle: string
  ) => {
    e.preventDefault();

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data: ApiResponse = await response.json();

      if (data && data.data && data.data.length > 0) {
        const exactMatches = data.data.filter(
          (discussion: Discussion) => discussion.attributes.title === exactTitle
        );

        if (exactMatches.length > 0) {
          // Navigate to the first exact match found in a new tab
          window.open(
            `https://trippy.wtf/forum/d/${exactMatches[0].id}`,
            '_blank'
          );
        } else {
          // No exact matches, open the composer in a new tab with the title in the URL
          window.open(
            `https://trippy.wtf/forum/composer?title=${encodeURIComponent(
              exactTitle
            )}`,
            '_blank'
          );
        }
      } else {
        // No data found, open the composer in a new tab with the title in the URL
        window.open(
          `https://trippy.wtf/forum/composer?title=${encodeURIComponent(
            exactTitle
          )}`,
          '_blank'
        );
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
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
                {isAdmin && (
                  <li className="items">
                    <Link to="/admin-dashboard">Admin Dashboard</Link>
                  </li>
                )}
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
                    {sortedDocuments.map((document, index) => {
                      const modifiedLink = document.link.replace(
                        /<a/g,
                        '<a target="_blank"'
                      );

                      // Extract the text between the <a> tags
                      const linkTextMatch =
                        document.link.match(/<a[^>]*>([^<]*)<\/a>/);
                      const linkText = linkTextMatch ? linkTextMatch[1] : '';
                      // Create the new link with the correct URL format
                      const newLink = `<a href="https://trippy.wtf/forum/composer?title=${encodeURIComponent(
                        linkText
                      )}" target="_blank" className="new" >\u{1F632}</a>`;
                      const apiUrl = `https://trippy.wtf/forum/api/discussions?filter[q]=${encodeURIComponent(
                        linkText
                      )}`;
                      return (
                        <li key={index}>
                          <span
                            onClick={(e) => handleClick(e, apiUrl, linkText)}
                            dangerouslySetInnerHTML={{ __html: newLink }}
                          />
                          <span
                            dangerouslySetInnerHTML={{ __html: modifiedLink }}
                          />
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            }
          />
          <Route path="/register" element={<UserRegistration />} />
          <Route
            path="/login"
            element={
              <LoginForm
                setIsAuthenticated={setIsAuthenticated}
                setIsAdmin={setIsAdmin}
              />
            }
          />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/update-profile" element={<UpdateUserProfile />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/password-reset" element={<ResetPassword />} />
          <Route
            path="/password-request"
            element={<PasswordResetRequestForm />}
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
