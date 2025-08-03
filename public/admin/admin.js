document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/index.html';
        return;
    }

    // --- Setup Event Listeners ---
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '/index.html';
    });
    
    // Setup modals
    setupModal('add-batch-btn', 'batch-modal', 'batch-close-btn');
    setupModal('add-intern-btn', 'intern-modal', 'intern-close-btn', populateBatchDropdown);
    
    // Setup form submissions
    document.getElementById('batch-form').addEventListener('submit', handleBatchSubmit);
    document.getElementById('intern-form').addEventListener('submit', handleInternSubmit);
    document.getElementById('assign-task-form').addEventListener('submit', handleTaskAssignSubmit);
    
    // --- Load all initial data ---
    loadAdminDashboard();
});

const API_URL = '/api/admin';
const token = localStorage.getItem('token');
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
};

async function loadAdminDashboard() {
    // Fetch all data first
    const [batches, interns] = await Promise.all([
        fetch(`${API_URL}/batches`, { headers }).then(res => res.json()),
        fetch(`${API_URL}/interns`, { headers }).then(res => res.json())
    ]);

    renderTable('batches-table', batches, (batch) => `<td>${batch.batch_name}</td><td>${new Date(batch.start_date).toLocaleDateString()}</td><td>${new Date(batch.end_date).toLocaleDateString()}</td>`);
    renderTable('interns-table', interns, (intern) => `<td>${intern.name}</td><td>${intern.email}</td><td>${intern.department}</td>`);
    
    populateInternDropdown(interns);
    
    setupAdminChat(interns);
}

function renderTable(tableId, data, rowRenderer) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    tbody.innerHTML = '';
    data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            ${rowRenderer(item)}
            
        `;
        tbody.appendChild(row);
    });
}

function setupModal(addBtnId, modalId, closeBtnId, onOpen) {
    const modal = document.getElementById(modalId);
    const addBtn = document.getElementById(addBtnId);
    const closeBtn = document.getElementById(closeBtnId);
    addBtn.onclick = () => {
        document.getElementById(modalId.replace('modal', 'form')).reset();
        if (onOpen) onOpen();
        modal.style.display = 'block';
    }
    closeBtn.onclick = () => modal.style.display = 'none';
    window.addEventListener('click', (event) => {
        if (event.target == modal) modal.style.display = 'none';
    });
}

async function handleBatchSubmit(event) {
    event.preventDefault();
    const batchData = {
        batch_name: document.getElementById('batch-name').value,
        start_date: document.getElementById('batch-start-date').value,
        end_date: document.getElementById('batch-end-date').value
    };
    await fetch(`${API_URL}/batches`, { method: 'POST', headers, body: JSON.stringify(batchData) });
    document.getElementById('batch-modal').style.display = 'none';
    loadAdminDashboard(); 
}

async function handleInternSubmit(event) {
    event.preventDefault();
    const internData = {
        name: document.getElementById('intern-name').value,
        email: document.getElementById('intern-email').value,
        password: document.getElementById('intern-password').value,
        department: document.getElementById('intern-department').value,
        age: document.getElementById('intern-age').value,
        batch_id: document.getElementById('intern-batch-select').value,
        mentor_id: 1
    };
    await fetch(`${API_URL}/interns`, { method: 'POST', headers, body: JSON.stringify(internData) });
    document.getElementById('intern-modal').style.display = 'none';
    loadAdminDashboard(); 
}

async function handleTaskAssignSubmit(event) {
    event.preventDefault();
    const taskData = {
        title: document.getElementById('task-title').value,
        description: document.getElementById('task-description').value,
        deadline_date: document.getElementById('task-deadline').value,
        assigned_to: document.getElementById('task-intern-select').value
    };

    const response = await fetch(`${API_URL}/tasks`, { 
        method: 'POST', 
        headers, 
        body: JSON.stringify(taskData) 
    });

    
    const data = await response.json();

    if (response.ok) {
        alert('Task assigned successfully!');
        event.target.reset();
    } else {
        alert(`Failed to assign task: ${data.message}`);
    }
}

async function handleTableClick(event) {
    const target = event.target;
    if (target.classList.contains('delete-btn')) {
        const id = target.dataset.id;
        const type = target.dataset.type;
        if (confirm(`Are you sure you want to delete this ${type.slice(0, -1)}?`)) {
            await fetch(`${API_URL}/${type}/${id}`, { method: 'DELETE', headers });
            loadAdminDashboard();
        }
    }
}

async function populateBatchDropdown() {
    const response = await fetch(`${API_URL}/batches`, { headers });
    const batches = await response.json();
    const select = document.getElementById('intern-batch-select');
    select.innerHTML = '';
    batches.forEach(batch => {
        const option = document.createElement('option');
        option.value = batch.id;
        option.textContent = batch.batch_name;
        select.appendChild(option);
    });
}

function populateInternDropdown(interns) {
    const select = document.getElementById('task-intern-select');
    select.innerHTML = '<option value="">-- Select an Intern --</option>';
    interns.forEach(intern => {
        const option = document.createElement('option');
        option.value = intern.id;
        option.textContent = `${intern.name} (${intern.email})`;
        select.appendChild(option);
    });
}

// --- CHAT LOGIC FOR ADMIN ---
function setupAdminChat(interns) {
    const socket = io("http://localhost:3001");
    const selfId = JSON.parse(atob(token.split('.')[1])).user.id;
    let activeChatId = null;

    socket.on('connect', () => socket.emit('joinRoom', selfId));
    socket.on('message', ({ text }) => appendMessage(text, 'received'));

    const contactList = document.getElementById('chat-contact-list');
    contactList.innerHTML = ''; 
    interns.forEach(intern => {
        const contactDiv = document.createElement('div');
        contactDiv.className = 'contact-item';
        contactDiv.textContent = intern.name;
        contactDiv.dataset.id = intern.id;
        contactDiv.onclick = () => {
            activeChatId = intern.id;
            document.querySelectorAll('.contact-item').forEach(c => c.classList.remove('active'));
            contactDiv.classList.add('active');
            document.getElementById('chat-input').disabled = false;
            document.getElementById('chat-send-btn').disabled = false;
            document.getElementById('chat-messages').innerHTML = '';
        };
        contactList.appendChild(contactDiv);
    });

    document.getElementById('chat-send-btn').onclick = () => {
        const input = document.getElementById('chat-input');
        if (input.value && activeChatId) {
            socket.emit('privateMessage', { receiverId: activeChatId, message: input.value });
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