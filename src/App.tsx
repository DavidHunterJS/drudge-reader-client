import React, { useEffect, useState } from 'react';
import socketIOClient from 'socket.io-client';
import './App.css';
const ENDPOINT = 'https://trippy.wtf';

interface Document {
  title: string;
  link: string;
  // Add other document properties as needed
}

const App: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    // Connect to the server using Socket.io
    const socket = socketIOClient(ENDPOINT);

    // Listen for the initialDocuments event
    socket.on('initialDocuments', (initialDocuments: Document[]) => {
      setDocuments(initialDocuments);
    });

    // Listen for the updateDocuments event
    socket.on('updateDocuments', (updatedDocuments: Document[]) => {
      setDocuments(updatedDocuments);
    });

    return () => {
      // Disconnect from the server when the component unmounts
      socket.disconnect();
    };
  }, []);
  console.log('documents: ', documents);
  return (
    <div>
      <h1>Drudge Reader</h1>
      <div>
        <h2>News Stories</h2>
        <ul>
          {documents.map((document, index) => (
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
  );
};

export default App;
