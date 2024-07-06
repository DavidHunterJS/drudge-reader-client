// app.tsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios, { AxiosRequestConfig } from 'axios';
import socketIOClient from 'socket.io-client';
import 'bootswatch/dist/journal/bootstrap.min.css';
import {
  BrowserRouter as Router,
  Route,
  Link,
  Routes,
  useNavigate,
} from 'react-router-dom';
import UserRegistration from './components/userRegistration';
import LoginForm from './components/loginForm';
import UpdateUserProfile from './components/updateUserProfile';
import AdminDashboard from './components/adminDashboard';
import PasswordResetRequestForm from './components/PasswordResetRequestForm';
import ResetPassword from './components/ResetPassword';
import './App.css';
import { jwtDecode } from 'jwt-decode';
import screen from './images/screen.png';
import bcrypt from 'bcryptjs';

const ENDPOINT =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_PROD_ENDPOINT || ''
    : process.env.REACT_APP_DEV_ENDPOINT || '';

const axiosInstance = axios.create({
  baseURL: ENDPOINT,
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

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
  const [sortedDocuments, setSortedDocuments] = useState<Document[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [modifiedLinks, setModifiedLinks] = useState([]);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      // You might need to make an API call to get user details including role
      // since Flarum doesn't seem to include role information in the token
      axiosInstance
        .get('/api/users/me')
        .then((response) => {
          setIsAdmin(response.data.data.attributes.isAdmin || false);
        })
        .catch((error) => {
          console.error('Error fetching user details:', error);
          setIsAuthenticated(false);
          setIsAdmin(false);
          localStorage.removeItem('token');
        });
    } else {
      setIsAuthenticated(false);
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

  // THIS KEEPS THE TOOLTIP NEAR THE MOUSE AT ALL TIMES
  const handleMouseMove = (event: React.MouseEvent<HTMLLIElement>) => {
    const tooltip = event.currentTarget.querySelector(
      '.tooltipimg'
    ) as HTMLElement;
    if (tooltip) {
      const { left, top } = event.currentTarget.getBoundingClientRect();
      const offsetX = 10; // Adjust the horizontal offset as needed
      const offsetY = 10; // Adjust the vertical offset as needed
      tooltip.style.left = `${event.clientX - left + offsetX}px`;
      tooltip.style.top = `${event.clientY - top + offsetY}px`;
    }
  };

  useEffect(() => {
    // Sort the documents based on the defined page location order
    const sorted = [...documents].sort((a, b) => {
      const indexA = pageLocationOrder.indexOf(a.pageLocation);
      const indexB = pageLocationOrder.indexOf(b.pageLocation);
      return indexA - indexB;
    });
    setSortedDocuments(sorted);
  }, [documents]);

  useEffect(() => {
    const fetchModifiedLinks = async () => {
      if (sortedDocuments.length > 0) {
        try {
          const response = await axiosInstance.post('/api/modified-links', {
            sortedDocuments,
          });
          setModifiedLinks(response.data);
          // console.log(response.data);
        } catch (error) {
          console.error('Error fetching modified links:', error);
        }
      }
    };

    fetchModifiedLinks();
  }, [sortedDocuments]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Router>
      <div>
        <div>
          <nav>
            <ul id="list">
              <li className="items">
                <Link to="/">HOME</Link>
              </li>
              <li className="items">
                <Link to="https://trippy.wtf/forum">FORUM</Link>
              </li>
              {!isAuthenticated ? (
                <>
                  <li className="items">
                    <Link to="/login">LOGIN</Link>
                  </li>
                  <li className="items">
                    <Link to="/signup">SIGNUP</Link>
                  </li>
                </>
              ) : (
                <>
                  <li className="items">
                    <Link to="/profile">Profile</Link>
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
        </div>

        <Routes>
          <Route
            path="/"
            element={
              <div id="bg">
                <h1 id="title">
                  Drudge <span id="reader">Reader</span>
                </h1>
                <div id="main">
                  <h3 id="cta" className="glowing-text">
                    Read and Comment On The Latest News Stories
                  </h3>
                  <ul className="list">
                    {modifiedLinks.map(({ linkId, newLink, modifiedLink }) => {
                      return (
                        <li
                          className="toolz"
                          key={linkId}
                          style={{ position: 'relative' }}
                          onMouseMove={handleMouseMove}
                        >
                          <span
                            dangerouslySetInnerHTML={{ __html: modifiedLink }}
                          />
                          <span dangerouslySetInnerHTML={{ __html: newLink }} />
                          <img
                            className="tooltipimg"
                            src={`./images/${linkId}.png`}
                            alt="tooltip"
                          />
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            }
          />
          <Route path="/signup" element={<UserRegistration />} />
          <Route
            path="/login"
            element={
              <LoginForm
                setIsAuthenticated={setIsAuthenticated}
                setIsAdmin={setIsAdmin}
              />
            }
          />
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
