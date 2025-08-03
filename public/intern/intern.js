document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/index.html';
        return;
    }

    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '/index.html';
    });

    loadInternDashboard();
});

async function loadInternDashboard() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('/api/intern/dashboard', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            if (response.status === 401) window.location.href = '/index.html';
            throw new Error('Could not fetch dashboard data.');
        }
        const data = await response.json();
        populateDashboard(data);
        setupInternChat(data.details.mentor_id, data.details.mentor_name);
    } catch (error) {
        console.error(error);
    }
}

function populateDashboard(data) {
    document.getElementById('welcome-name').textContent = `Welcome, ${data.details.name}!`;
    document.getElementById('detail-email').textContent = data.details.email;
    document.getElementById('detail-department').textContent = data.details.department;
    document.getElementById('detail-mentor').textContent = data.details.mentor_name;

    const tasksContainer = document.getElementById('tasks-container');
    tasksContainer.innerHTML = '';
    if (data.tasks.length === 0) {
        tasksContainer.innerHTML = '<p>You have no assigned tasks.</p>';
        return;
    }

    data.tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        taskElement.innerHTML = `
            <div class="task-details">
                <h3>${task.title}</h3>
                <p>Deadline: ${new Date(task.deadline_date).toLocaleDateString()}</p>
                <p>Mentor: ${task.mentor_name}</p>
            </div>
            <div class="task-status">
                <select class="status-select" data-task-id="${task.id}">
                    <option value="Not Started" ${task.status === 'Not Started' ? 'selected' : ''}>Not Started</option>
                    <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                    <option value="Completed" ${task.status === 'Completed' ? 'selected' : ''}>Completed</option>
                </select>
            </div>
        `;
        tasksContainer.appendChild(taskElement);
    });

    document.querySelectorAll('.status-select').forEach(select => {
        select.addEventListener('change', handleStatusUpdate);
    });
}

async function handleStatusUpdate(event) {
    const token = localStorage.getItem('token');
    const taskId = event.target.dataset.taskId;
    const newStatus = event.target.value;
    await fetch(`/api/intern/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
    });
}

// --- CHAT LOGIC FOR INTERN ---
function setupInternChat(mentorId, mentorName) {
    const token = localStorage.getItem('token');
    const socket = io("http://localhost:3001");
    const selfId = JSON.parse(atob(token.split('.')[1])).user.id;

    document.getElementById('chat-with-mentor').textContent = `Chat with ${mentorName}`;

    socket.on('connect', () => socket.emit('joinRoom', selfId));
    socket.on('message', ({ text }) => appendMessage(text, 'received'));

    document.getElementById('chat-send-btn').onclick = () => {
        const input = document.getElementById('chat-input');
        if (input.value && mentorId) {
            socket.emit('privateMessage', { receiverId: mentorId, message: input.value });
            appendMessage(input.value, 'sent');
            input.value = '';
        }
    };

    function appendMessage(text, type) {
        const messagesDiv = document.getElementById('chat-messages');
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${type}`;
        msgDiv.innerHTML = `<span>${text}</span>`;
        messagesDiv.appendChild(msgDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    };

    document.getElementById('chat-toggle-btn').addEventListener('click', () => {
        const body = document.getElementById('chat-body');
        body.style.display = body.style.display === 'none' ? 'flex' : 'none';
    });
}