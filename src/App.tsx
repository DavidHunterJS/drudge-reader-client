import React, { useEffect, useState } from 'react';
import socketIOClient from 'socket.io-client';
import 'bootswatch/dist/quartz/bootstrap.min.css';
import './App.css';
const ENDPOINT = 'https://trippy.wtf';

interface Document {
  title: string;
  link: string;
  pageLocation: string;
  // Add other document properties as needed
}

const App: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [error, setError] = useState<string | null>(null);

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
    <div>
      <div id="bg">
        <h1 id="title">
          Drudge <span id="reader">Reader</span>
        </h1>
        <div>
          <h3 id="cta" className="glowing-text">
            The Latest Stories
          </h3>
          <ul>
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
    </div>
  );
};

export default App;
