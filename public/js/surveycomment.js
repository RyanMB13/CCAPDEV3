document.addEventListener("DOMContentLoaded", function () {
    const commentInput = document.querySelector('.comment-input');
    const btnAddComment = document.querySelector('.btn-add-comment');
    const commentsSection = document.querySelector('.comments-section');
    
    btnAddComment.addEventListener('click', function () {
      const commentText = commentInput.value;
      if (commentText.trim() !== '') {
        const newComment = document.createElement('div');
        newComment.classList.add('comment');
        
        const timestamp = new Date().toLocaleString();
        newComment.innerHTML = `<p><strong>You</strong> | ${timestamp}</p><p>${commentText}</p>`;
        
        commentsSection.appendChild(newComment);

        commentInput.value = '';
      }
    });
  });