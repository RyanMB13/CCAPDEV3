document.addEventListener("DOMContentLoaded", function () {
  const likeBtns = document.querySelectorAll('.like-btn');
  const dislikeBtns = document.querySelectorAll('.dislike-btn');

  likeBtns.forEach(likeBtn => {
    likeBtn.addEventListener('click', async function () {
      const postId = this.dataset.postId;
      try {
        const response = await fetch(`/likePost/${postId}`, {
          method: 'POST',
        });
        if (!response.ok) {
          throw new Error('Failed to like post');
        }
        const data = await response.json();
        const likeCount = this.querySelector('.like-count');
        likeCount.textContent = data.likes;
      } catch (error) {
        console.error('Error liking post:', error);
      }
    });
  });

  dislikeBtns.forEach(dislikeBtn => {
    dislikeBtn.addEventListener('click', async function () {
      const postId = this.dataset.postId;
      try {
        const response = await fetch(`/dislikePost/${postId}`, {
          method: 'POST',
        });
        if (!response.ok) {
          throw new Error('Failed to dislike post');
        }
        const data = await response.json();
        const dislikeCount = this.querySelector('.dislike-count');
        dislikeCount.textContent = data.dislikes;
      } catch (error) {
        console.error('Error disliking post:', error);
      }
    });
  });

  const deletePostBtn = document.querySelector('.delete-post-btn');

  deletePostBtn.addEventListener('click', async function () {
    const postId = this.dataset.postId;
    try {
      const response = await fetch(`/deletePost/${postId}`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to delete post');
      }
      window.location.href = '/'; 
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  });

  const editPostBtn = document.querySelector('.edit-post-btn');

  editPostBtn.addEventListener('click', async function () {

    console.log("EDIT CLICKED");

      const postId = this.dataset.postId;
  
      console.log('Edit button clicked for post ID:', postId);
  
      // Retrieve the current post title and content
      const postTitleElement = document.getElementById('postTitle');
      const postContentElement = document.getElementById('postContent');
      const currentPostTitle = postTitleElement.textContent;
      const currentPostContent = postContentElement.textContent;
  
      console.log('Current post title:', currentPostTitle);
      console.log('Current post content:', currentPostContent);
  
      // Prompt the user to enter the new Post title and content
      const newPostTitle = prompt('Enter the new post title:', currentPostTitle);
      const newPostContent = prompt('Enter the new post content:', currentPostContent);
  
      console.log('New post title entered by user:', newPostTitle);
      console.log('New post content entered by user:', newPostContent);
  
      if (newPostTitle !== null && newPostContent !== null) {
          try {
              // Send a POST request to the server to update the Post data
              const response = await fetch(`/editPost/${postId}`, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ postTitle: newPostTitle, postContent: newPostContent })
              });
  
              if (!response.ok) {
                  throw new Error('Failed to edit post');
              }
  
              console.log('Post successfully edited.');
  
              // Reload the page to reflect the updated post data
              window.location.reload();
          } catch (error) {
              console.error('Error editing post:', error);
              alert('Failed to edit post. Please try again later.');
          }
      } else {
          console.log('User canceled the edit operation.');
      }
  });
});
