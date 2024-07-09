// frontend/src/components/ScreenshotFetcher.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const ScreenshotFetcher: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScreenshots = async () => {
      try {
        const response = await axios.get('/screenshots');
        const screenshotFiles = response.data.screenshots;

        const imagesDir = path.join(__dirname, '..', 'images');

        // Create the images directory if it doesn't exist
        if (!fs.existsSync(imagesDir)) {
          fs.mkdirSync(imagesDir);
        }

        // Fetch and save each screenshot
        for (const screenshot of screenshotFiles) {
          const screenshotResponse = await axios.get(
            `/screenshots/${screenshot}`,
            {
              responseType: 'stream',
            }
          );

          const screenshotPath = path.join(imagesDir, screenshot);
          const writer = fs.createWriteStream(screenshotPath);

          screenshotResponse.data.pipe(writer);

          await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
          });
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching screenshots:', error);
        setError('Failed to fetch screenshots.');
        setLoading(false);
      }
    };

    fetchScreenshots();
  }, []);

  if (loading) {
    return <div>Loading screenshots...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return <div>Screenshots fetched and saved successfully.</div>;
};

export default ScreenshotFetcher;
