const app = () => {
  const socket = io('https://chat-6-5-1.onrender.com');

  const msgInput = document.querySelector('.message-input');
  const msgList = document.querySelector('.messages-list');
  const sendBtn = document.querySelector('.send-btn');
  const usernameInput = document.querySelector('.username-input');
  const usersList = document.querySelector('.users-list');

  const messages = [];
  let username = '';

  const handleSendMessage = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (!username) {
      username = usernameInput.value.trim() || 'Anonymous';
      socket.emit('join', username);
    }

    const message = {
      username,
      text: trimmed,
      createdAt: new Date(),
    };

    socket.emit('sendMessage', message);
    msgInput.value = '';
  };

  const renderMessages = (data) => {
    let html = '';
    data.forEach((message) => {
      html += `
        <li class="bg-dark p-2 rounded mb-2 d-flex justify-content-between message">
          <div class="mr-2">
            <span class="text-info">${message.username}</span>
            <p class="text-light">${message.text}</p>
          </div>
          <span class="text-muted text-right date">
            ${new Date(message.createdAt).toLocaleString('ru', {
              year: 'numeric',
              month: 'numeric',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
            })}
          </span>
          ${
            message.username === username
              ? `
                <button class="btn btn-sm btn-warning edit-btn" data-id="${message.id}">✏️</button>
                <button class="btn btn-sm btn-danger delete-btn" data-id="${message.id}">🗑️</button>
              `
              : ''
          }
        </li>`;
    });

    msgList.innerHTML = html;

    msgList.querySelectorAll('.edit-btn').forEach((btn) =>
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id, 10);
        const newText = prompt('Введите новый текст');
        if (newText?.trim()) {
          socket.emit('editMessage', { id, text: newText.trim() });
        }
      }),
    );

    msgList.querySelectorAll('.delete-btn').forEach((btn) =>
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id, 10);
        socket.emit('deleteMessage', id);
      }),
    );
  };

  msgInput.addEventListener('keydown', (e) => {
    if (e.keyCode === 13) handleSendMessage(e.target.value);
  });

  sendBtn.addEventListener('click', () => handleSendMessage(msgInput.value));

  socket.on('recMessage', (message) => {
    messages.push(message);
    renderMessages(messages);
  });

  socket.on('systemMessage', (msg) => {
    const li = document.createElement('li');
    li.textContent = msg;
    li.classList.add('text-muted');
    msgList.appendChild(li);
  });

  socket.on('usersList', (users) => {
    usersList.innerHTML = users.map((u) => `<li>${u}</li>`).join('');
  });

  socket.on('messageEdited', (updated) => {
    const index = messages.findIndex((m) => m.id === updated.id);
    if (index !== -1) {
      messages[index].text = updated.text;
      renderMessages(messages);
    }
  });

  socket.on('messageDeleted', (id) => {
    const index = messages.findIndex((m) => m.id === id);
    if (index !== -1) {
      messages.splice(index, 1);
      renderMessages(messages);
    }
  });

  socket.on('error', (msg) => {
    alert(`Ошибка: ${msg}`);
  });
};

app();
