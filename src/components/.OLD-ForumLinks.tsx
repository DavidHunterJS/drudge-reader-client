import React from 'react';

interface ForumLinkProps {
  href: string;
  children: React.ReactNode; // This type is appropriate for any valid React child
}

const ForumLink: React.FC<ForumLinkProps> = ({ href, children }) => {
  const handleClick = async (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    event.preventDefault(); // Prevent default anchor behavior

    const url = new URL(href);
    const title = url.searchParams.get('title')?.trim();
    if (title) {
      console.log('Title extracted:', title);
      await handleNewDiscussion(title);
    } else {
      console.log('No title found in the URL');
    }
  };

  return (
    <a href={href} onClick={handleClick} className="new">
      {children}
    </a>
  );
};

export async function handleNewDiscussion(title: string) {
  try {
    // Check if a discussion with the same title already exists
    const response = await fetch(
      `https://trippy.wtf/forum/api/discussions?filter[q]=${encodeURIComponent(
        title
      )}`
    );
    const data = await response.json();

    if (data.data.length > 0) {
      // If a duplicate discussion exists, redirect to the existing discussion
      const discussionId = data.data[0].id;
      window.location.href = `https://trippy.wtf/forum/d/${discussionId}`;
    } else {
      // If no duplicate discussion exists, open the composer with the pre-filled title
      const composerUrl = `https://trippy.wtf/forum/composer?title=${encodeURIComponent(
        title
      )}`;
      window.location.href = composerUrl;
    }
  } catch (error) {
    console.error('Error handling new discussion:', error);
    // Handle the error, show an error message, or perform any necessary actions
  }
}

export default ForumLink;
