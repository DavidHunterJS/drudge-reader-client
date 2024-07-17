// src/App.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import socketIOClient from 'socket.io-client';
import 'bootswatch/dist/journal/bootstrap.min.css';
import {
  BrowserRouter as Router,
  Route,
  Link,
  Routes,
  Navigate,
} from 'react-router-dom';
import UserRegistration from './components/userRegistration';
import LoginForm from './components/loginForm';
import UpdateUserProfile from './components/updateUserProfile';
import GetUserProfile from './components/getUserProfile';
import AdminDashboard from './components/adminDashboard';
import PasswordResetRequestForm from './components/PasswordResetRequestForm';
import ResetPassword from './components/ResetPassword';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const ENDPOINT =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_PROD_ENDPOINT || ''
    : process.env.REACT_APP_DEV_ENDPOINT || '';

const axiosInstance = axios.create({
  baseURL: ENDPOINT,
  withCredentials: true,
});

interface Document {
  title: string;
  link: string;
  pageLocation: string;
}

interface Discussion {
  id: string;
  attributes: {
    title: string;
  };
}

interface ApiResponse {
  data: Discussion[];
}

const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({
  element,
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? element : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

const AppContent: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [sortedDocuments, setSortedDocuments] = useState<Document[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [modifiedLinks, setModifiedLinks] = useState([]);

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);

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

  const pageLocationOrder = [
    'Headline',
    'topLeft',
    'column1',
    'column2',
    'column3',
  ];

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
          window.open(
            `https://trippy.wtf/forum/d/${exactMatches[0].id}`,
            '_blank'
          );
        } else {
          window.open(
            `https://trippy.wtf/forum/composer?title=${encodeURIComponent(
              exactTitle
            )}`,
            '_blank'
          );
        }
      } else {
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

  const handleMouseMove = (event: React.MouseEvent<HTMLLIElement>) => {
    const tooltip = event.currentTarget.querySelector(
      '.tooltipimg'
    ) as HTMLElement;
    if (tooltip) {
      const { left, top } = event.currentTarget.getBoundingClientRect();
      const offsetX = 10;
      const offsetY = 10;
      tooltip.style.left = `${event.clientX - left + offsetX}px`;
      tooltip.style.top = `${event.clientY - top + offsetY}px`;
    }
  };

  useEffect(() => {
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <nav>
        <ul id="list">
          <li className="items">
            <Link to="/">HOME</Link>
          </li>
          <li className="items">
            <a href="https://trippy.wtf/forum">FORUM</a>
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
                <Link to="/" onClick={logout}>
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
            <HomePage
              modifiedLinks={modifiedLinks}
              handleMouseMove={handleMouseMove}
            />
          }
        />
        <Route path="/signup" element={<UserRegistration />} />
        <Route path="/login" element={<LoginForm />} />
        <Route
          path="/profile"
          element={<ProtectedRoute element={<GetUserProfile />} />}
        />
        <Route
          path="/admin-dashboard"
          element={isAuthenticated ? <AdminDashboard /> : <Navigate to="/" />}
        />
        <Route path="/password-reset" element={<ResetPassword />} />
        <Route
          path="/password-request"
          element={<PasswordResetRequestForm />}
        />
      </Routes>
    </div>
  );
};

const HomePage: React.FC<{
  modifiedLinks: any[];
  handleMouseMove: (event: React.MouseEvent<HTMLLIElement>) => void;
}> = ({ modifiedLinks, handleMouseMove }) => (
  <div id="bg">
    <h1 id="title">
      Drudge <span id="reader">Reader</span>
    </h1>
    <div id="main">
      <h3 id="cta" className="glowing-text">
        Read and Comment On The Latest News Stories
      </h3>
      <ul className="list">
        {modifiedLinks.map(({ linkId, newLink, modifiedLink }) => (
          <li
            className="toolz"
            key={linkId}
            style={{ position: 'relative' }}
            onMouseMove={handleMouseMove}
          >
            <span dangerouslySetInnerHTML={{ __html: modifiedLink }} />
            <span dangerouslySetInnerHTML={{ __html: newLink }} />
            <img
              className="tooltipimg"
              src={`./images/${linkId}.png`}
              alt="tooltip"
            />
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default App;
