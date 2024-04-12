$(document).ready(function(){
    $("#createPostBtn").click(function(){
      $(".post-form").toggle();
    });
  });

  const commentInput = document.querySelector('.comment-input');
  const btnAddComment = document.querySelector('.btn-add-comment');
  const commentsSection = document.querySelector('.comments-section');
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0'); //Adding 1 to month index as it starts from 0
  const day = String(currentDate.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`; //Date format
  document.getElementById('postDate').value = formattedDate;



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

    function redirectToLink() {
      window.location.href = 'maincomments';
    }