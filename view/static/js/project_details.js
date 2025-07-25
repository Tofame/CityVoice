document.addEventListener('DOMContentLoaded', async () => {
    const commentForm = document.getElementById('comment-form');
    const commentContent = document.getElementById('commentContent');
    const commentsList = document.getElementById('comments-list');
    const noCommentsMessage = document.getElementById('no-comments-message');
    const commentCountSpan = document.getElementById('comment-count');
    const commentMessage = document.getElementById('comment-message');
    const comments = document.querySelectorAll('.project-comment');

    if (commentForm) {
        commentForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const content = commentContent.value.trim();
            if (!content) {
                commentMessage.textContent = 'Comment cannot be empty.';
                commentMessage.className = 'mt-2 text-sm text-red-600';
                commentMessage.style.display = 'block';
                return;
            }

            const projectId = commentForm.getAttribute('data-project-id');
            if (!projectId || isNaN(projectId)) {
                commentMessage.textContent = 'Error: Project ID not found in URL.';
                commentMessage.className = 'mt-2 text-sm text-red-600';
                commentMessage.style.display = 'block';
                return;
            }

            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`/api/project/${projectId}/comments`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token && { 'Authorization': `Bearer ${token}` })
                    },
                    body: JSON.stringify({ content: content })
                });

                const result = await response.json(); // Parse the JSON response

                if (response.ok) {
                    commentMessage.textContent = 'Comment added successfully!';
                    commentMessage.className = 'mt-2 text-sm text-green-600';
                    commentMessage.style.display = 'block';

                    const newCommentDiv = document.createElement('div');
                    newCommentDiv.className = 'bg-gray-200 p-4 rounded-lg shadow-sm border border-gray-100';

                    const now = new Date();
                    const formattedDate = now.toLocaleString('en-US', {
                        month: 'short', day: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit', hour12: false
                    });

                    const authorName = "You";
                    newCommentDiv.innerHTML = `
                        <p class="comment-author text-gray-800 font-semibold mb-1">${authorName}</p>
                        <p class="text-gray-700 text-sm mb-2">${result.content}</p>
                        <span class="text-xs text-gray-500">${formattedDate}</span>
                    `;
                    const authorElem = newCommentDiv.querySelector('.comment-author');
                    authorElem.classList.add('current-user-comment');

                    if (noCommentsMessage && commentsList.contains(noCommentsMessage)) {
                        commentsList.removeChild(noCommentsMessage);
                    }

                    // Add the new comment to the top of the comments list
                    commentsList.prepend(newCommentDiv);

                    let currentCount = parseInt(commentCountSpan.textContent);
                    commentCountSpan.textContent = currentCount + 1;

                    commentContent.value = '';
                    setTimeout(() => {
                        commentMessage.style.display = 'none';
                    }, 5000);

                } else {
                    commentMessage.textContent = `Error: ${result.error || 'Failed to submit comment.'}`;
                    commentMessage.className = 'mt-2 text-sm text-red-600';
                    commentMessage.style.display = 'block';
                }
            } catch (error) {
                console.error('Network or parsing error:', error);
                commentMessage.textContent = 'An unexpected error occurred. Please try again.';
                commentMessage.className = 'mt-2 text-sm text-red-600';
                commentMessage.style.display = 'block';
            }
        });
    } else {
        console.warn("Comment form not found.");
    }

    updateCommentAuthors();
});

function updateCommentAuthors() {
    const currentUserId = String(getCurrentUserIdFromToken());
    const comments = document.querySelectorAll('.project-comment');

    comments.forEach(comment => {
        const userId = comment.dataset.userId;
        const authorElem = comment.querySelector('.comment-author');
        if (userId === currentUserId) {
            authorElem.textContent = "You";
            authorElem.classList.add('current-user-comment');
        }
    });
}