document.addEventListener("DOMContentLoaded", function () {
  const likeBtns = document.querySelectorAll('.like-btn');
  const dislikeBtns = document.querySelectorAll('.dislike-btn');

  likeBtns.forEach(likeBtn => {
    likeBtn.addEventListener('click', async function () {
      const eventId = this.dataset.eventId;
      try {
        const response = await fetch(`/likeEvent/${eventId}`, {
          method: 'POST',
        });
        if (!response.ok) {
          throw new Error('Failed to like event');
        }
        const data = await response.json();
        const likeCount = this.querySelector('.like-count');
        likeCount.textContent = data.likes;
      } catch (error) {
        console.error('Error liking event:', error);
      }
    });
  });

  dislikeBtns.forEach(dislikeBtn => {
    dislikeBtn.addEventListener('click', async function () {
      const eventId = this.dataset.eventId;
      try {
        const response = await fetch(`/dislikeEvent/${eventId}`, {
          method: 'POST',
        });
        if (!response.ok) {
          throw new Error('Failed to dislike event');
        }
        const data = await response.json();
        const dislikeCount = this.querySelector('.dislike-count');
        dislikeCount.textContent = data.dislikes;
      } catch (error) {
        console.error('Error disliking event:', error);
      }
    });
  });

  const deleteEventBtn = document.querySelector('.delete-event-btn');

  deleteEventBtn.addEventListener('click', async function () {
    const eventId = this.dataset.eventId;
    try {
      const response = await fetch(`/deleteEvent/${eventId}`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to delete event');
      }
      window.location.href = '/events'; 
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  });

  const editEventBtn = document.querySelector('.edit-event-btn');

  editEventBtn.addEventListener('click', async function () {

    console.log("EDIT CLICKED");

      const eventId = this.dataset.eventId;
  
      console.log('Edit button clicked for event ID:', eventId);
  
      // Retrieve the current event title and content
      const eventTitleElement = document.getElementById('eventTitle');
      const eventContentElement = document.getElementById('eventContent');
      const currentEventTitle = eventTitleElement.textContent;
      const currentEventContent = eventContentElement.textContent;
  
      console.log('Current event title:', currentEventTitle);
      console.log('Current event content:', currentEventContent);
  
      // Prompt the user to enter the new event title and content
      const newEventTitle = prompt('Enter the new event title:', currentEventTitle);
      const newEventContent = prompt('Enter the new event content:', currentEventContent);
  
      console.log('New event title entered by user:', newEventTitle);
      console.log('New event content entered by user:', newEventContent);
  
      if (newEventTitle !== null && newEventContent !== null) {
          try {
              // Send a POST request to the server to update the event data
              const response = await fetch(`/editEvent/${eventId}`, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ eventTitle: newEventTitle, eventContent: newEventContent })
              });
  
              if (!response.ok) {
                  throw new Error('Failed to edit event');
              }
  
              console.log('Event successfully edited.');
  
              // Reload the page to reflect the updated event data
              window.location.reload();
          } catch (error) {
              console.error('Error editing event:', error);
              alert('Failed to edit event. Please try again later.');
          }
      } else {
          console.log('User canceled the edit operation.');
      }
  });
});
