const commentForm = document.getElementById('comment-form');
const commentContent = document.getElementById('commentContent');
const commentsList = document.getElementById('comments-list');
const noCommentsMessage = document.getElementById('no-comments-message');
const commentCountSpan = document.getElementById('comment-count');
const commentMessage = document.getElementById('comment-message');

const buttonUpvote = document.getElementById('btn-upvote');
const buttonDownvote = document.getElementById('btn-downvote');

// This event is dispatched from navigation bar because there was race condition
// between load of navigation bar and project details, and we couldn't detect if user is admin because
// nav bar wasn't loaded while this updateCommentAuthors() was already complete.
document.addEventListener('navigationBarReady', () => {
    updateCommentAuthors();
});

function updateCommentAuthors() {
    const currentUserId = String(getCurrentUserIdFromToken());
    const comments = document.querySelectorAll('.project-comment');

    const commentManagePerms = isAdmin_Clientside() || isModerator_Clientside();

    comments.forEach(comment => {
        const userId = comment.dataset.userId;
        const authorElem = comment.querySelector('.comment-author');
        const commentButtons = comment.querySelector('.comment-management-btns');
        if (userId === currentUserId) {
            authorElem.textContent = "You";
            authorElem.classList.add('current-user-comment');
        }

        // Allow comment management
        if (userId === currentUserId || commentManagePerms) {
            commentButtons.classList.remove("hidden");
        }
    });
}

buttonUpvote.addEventListener("click", async () => {
    await castVote(1);
})

buttonDownvote.addEventListener("click", async () => {
    await castVote(-1);
})

async function castVote(vote) {
    const token = getAuthToken();
    if (!token) {
        showMessage("You need to login to vote on the projects!", 'error');
        return null;
    }

    const projectId = commentForm.getAttribute('data-project-id');
    if (!projectId || isNaN(projectId)) {
        showMessage("Something wrong occured! Couldn't vote", 'error');
        return;
    }

    const response = await fetch(`/api/project/${projectId}/vote`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ vote: vote })
    });

    if (!response.ok) {
        showMessage("Something wrong occured! Couldn't vote", 'error');
        return null;
    }

    const data = await response.json();
    if(data.message === "Vote removed") {
        if(vote < 1) {
            showMessage("Downvote cancelled!", 'error');
        } else {
            showMessage("Upvote cancelled!", 'error');
        }
    } else {
        if(vote < 1) {
            showMessage("Downvoted the project!", 'error');
        } else {
            showMessage("Upvoted the project!", 'success');
        }
    }

    // Update votes count
    buttonUpvote.textContent = "Vote up (" + data.votes_up + ")"
    buttonDownvote.textContent = "Vote down (" + data.votes_down + ")"
}

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
        const token = getAuthToken();
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
            newCommentDiv.className = 'relative bg-gray-200 p-4 rounded-lg shadow-sm border border-gray-100';

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
                        
                        <div class="comment-management-btns absolute top-2 right-2 flex gap-2 text-sm">
                            <button class="edit-comment text-blue-600 hover:underline">Edit</button>
                            <button class="delete-comment text-red-600 hover:underline">Delete</button>
                        </div>
                    `;
            const authorElem = newCommentDiv.querySelector('.comment-author');
            authorElem.classList.add('current-user-comment');

            // Important for knowing the id of the comment we will use it for edit/delete basically
            newCommentDiv.dataset.commentId = result.id;

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

commentsList.addEventListener('click', async function (e) {
    const target = e.target;

    // Delete
    if (target.classList.contains('delete-comment')) {
        const commentDiv = target.closest('.project-comment');
        if (!commentDiv) return;

        const confirmed = confirm("Are you sure you want to delete this comment?");
        if (!confirmed) return;

        const commentId = commentDiv.dataset.commentId;
        const projectId = commentForm.getAttribute('data-project-id');
        if (!projectId || isNaN(projectId)) {
            showMessage("Something wrong occured while trying to access project id!", 'error');
            return;
        }

        const token = getAuthToken();
        const response = await fetch(`/api/project/${projectId}/comments/${commentId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            commentDiv.remove();
            let currentCount = parseInt(commentCountSpan.textContent);
            commentCountSpan.textContent = currentCount - 1;
            showMessage("Comment deleted successfully", "success");

            if (commentsList.children.length === 0) {
                const msg = document.createElement('p');
                msg.id = 'no-comments-message';
                msg.className = 'text-gray-500';
                msg.textContent = 'No comments yet. Be the first to comment!';
                commentsList.appendChild(msg);
            }
        } else {
            const result = await response.json();
            showMessage(result.error || "Failed to delete comment", "error");
        }
    }

    // Edit
    if (target.classList.contains('edit-comment')) {
        const commentDiv = target.closest('.project-comment');
        if (!commentDiv) return;

        const contentElem = commentDiv.querySelector('p.text-gray-700');
        const originalText = contentElem.textContent;
        const newText = prompt("Edit your comment:", originalText);
        if (newText === null || newText.trim() === "" || newText === originalText) return;

        const commentId = commentDiv.dataset.commentId;
        const projectId = commentForm.getAttribute('data-project-id');
        const token = getAuthToken();

        const response = await fetch(`/api/project/${projectId}/comments/${commentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content: newText })
        });

        const result = await response.json();
        if (response.ok) {
            contentElem.textContent = result.content;
            showMessage("Comment updated!", "success");
        } else {
            showMessage(result.error || "Failed to update comment", "error");
        }
    }
});