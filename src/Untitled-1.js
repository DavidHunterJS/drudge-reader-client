// Function to check for duplicate titles
function checkDuplicateTitle(title, callback) {
  // Make an API request to search for discussions with similar titles
  console.log('checkDuplicateTitle fired!');
  fetch(
    `https://localhost/forum/api/discussions?filter[q]=${encodeURIComponent(
      title
    )}`
  )
    .then((response) => response.json())
    .then((data) => {
      // Check if any discussions with the same or similar titles exist
      if (data.data.length > 0) {
        // Duplicate or similar title found
        // Get the ID of the first matching discussion
        const discussionId = data.data[0].id;
        // Invoke the callback with the discussion ID
        callback(discussionId);
      } else {
        // No duplicate or similar title found
        // Invoke the callback with null
        callback(null);
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      // Handle any errors that occurred during the API request
      callback(null);
    });
}

// Function to open the composer with the pre-filled title
function openComposerWithTitle(title) {
  // Check for duplicate titles
  console.log('openComposerWithTitle fired!');
  checkDuplicateTitle(title, function (discussionId) {
    if (discussionId) {
      // If a duplicate title is found, redirect the user to the existing discussion
      window.location.href = `https://trippy.wtf/forum/d/${discussionId}`;
    } else {
      // If no duplicate title is found, open the composer with the pre-filled title
      app.composer.load('discussion', { user: app.session.user, title: title });
      app.composer.show();
    }
  });
}

// Event listener for the link click on trippy.wtf
document.addEventListener('DOMContentLoaded', function () {
  // Get the clicked link's title from the URL parameters
  console.log('User Clicked');

  const urlParams = new URLSearchParams(window.location.search);

  const linkTitle = urlParams.get('title');
  console.log(linkTitle);
  console.log(urlParams);
  // Check if the current page is the Flarum forum and a title is present in the URL
  if (window.location.href.includes('trippy.wtf/forum') && linkTitle) {
    // Open the composer with the pre-filled title
    console.log(linkTitle);
    // openComposerWithTitle(linkTitle);
  } else {
    console.log(
      "window.location.href.includes('trippy.wtf/forum') && linkTitle FAILED"
    );
  }
});

// gtp4
document.addEventListener('DOMContentLoaded', function () {
  const forumLinks = document.querySelectorAll('.new'); // Select all links with the class 'forum-link'

  forumLinks.forEach((link) => {
    link.addEventListener('click', function (event) {
      event.preventDefault(); // Prevent the default navigation
      const title = new URL(this.href).searchParams.get('title').trim();

      if (title) {
        async function handleNewDiscussion(title) {
          const existingDiscussions = await checkForExistingDiscussion(title);
          if (existingDiscussions) {
            console.log('Discussion already exists', existingDiscussions);
            // Possibly inform the user or link to the existing discussion
          } else {
            // Proceed to create a new discussion
            console.log('No existing discussion found, creating new one.');
          }
        }
      }
    });
  });

  async function checkForExistingDiscussion(title) {
    const apiUrl = `https://trippy.wtf/forum/api/discussions?filter[title]=${encodeURIComponent(
      title
    )}`;
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data); // Log the data to see the structure and use it accordingly
      if (data.data.length > 0) {
        return data.data; // Or handle the data as per your needs
      } else {
        return null; // No discussions found with the title
      }
    } catch (error) {
      console.error('Failed to fetch discussions:', error);
      return null; // Handle error or return error indication
    }
  }
});
