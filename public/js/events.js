    $(document).ready(function() {

      $(".univs button").click(function() {
        var buttonId = $(this).attr("id");

        $(".events .post").hide();

        switch (buttonId) {
          case "btnALL":
            $(".title").css("background-color", "white");
            $(".events .post").show();
            break;
          case "btnADMU":
            $(".title").css("background-color", "#cce5ff");
            $(".events #postADMU").show();
            break;
          case "btnDLSU":
            $(".title").css("background-color", "#d4edda");
            $(".events #postDLSU").show();
            break;
          case "btnUP":
            $(".title").css("background-color", "#f8d7da");
            $(".events #postUP").show();
            break;
          case "btnUST":
            $(".title").css("background-color", "#fff3cd");
            $(".events #postUST").show();
            break;
          case "btnFEU":
            $(".title").css("background-color", "#bfbfbf");
            $(".events #postFEU").show();
            break;  
          default:
            $(".title").css("background-color", "white"); 
            $(".events .post").show();
        }
      });
    });

// Show the add event modal
function showAddEventModal() {
  document.getElementById('myModal').style.display = 'block';
}

// Hide the add event modal
function hideAddEventModal() {
  document.getElementById('myModal').style.display = 'none';
}


// Submit event form data
async function submitEvent(event) {
  event.preventDefault();

  const eventTitle = document.getElementById('eventTitle').value;
  const eventDate = document.getElementById('eventDate').value;
  const eventContent = document.getElementById('eventContent').value;
  const eventType = document.getElementById('eventType').value;
  const eventPoster = "TEMPORARY USER NOT YET IMPLEMENTED";

  try {
    // Get the next event ID from the server
    const nextEventId = await fetch('/getNextEventId').then(res => res.json());

    // Submit the event data along with the next event ID
    const response = await fetch('/submitEvent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        eventTitle,
        eventPoster,
        eventDate,
        eventContent,
        eventType,
        eventId: nextEventId // Include the next event ID
      })
    });

    if (!response.ok) {
      throw new Error('Failed to submit event');
    }

    // Close the modal after successful submission
    hideAddEventModal();
    // Refresh the page to display the new event
    window.location.reload();
  } catch (error) {
    console.error('Error submitting event:', error);
    alert('Failed to submit event. Please try again.');
  }
}
