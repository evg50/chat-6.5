const app = () => {
  const socket = io('https://chat-6-5-1.onrender.com');

  const msgInput = document.querySelector('.message-input');
  console.log(msgInput); // should not be null
  const msgList = document.querySelector('.messages-list');
  const sendBtn = document.querySelector('.send-btn');
  const usernameInput = document.querySelector('.username-input');
  const messages = [];
  let username = '';
  const usersList = document.querySelector('.users-list');

  const handleSendMessage = (text) => {
    if (!text.trim()) {
      return;
    }

    if (!username) {
      username = usernameInput.value.trim() || 'Anonymous';
      socket.emit('join', username);
    }

    sendMessage({
      username: usernameInput.value || 'Anonymous',
      text,
      createdAt: new Date(),
    });
    msgInput.value = '';
  };

  msgInput.addEventListener(
    'keydown',
    (e) => e.keyCode === 13 && handleSendMessage(e.target.value),
  );

  sendBtn.addEventListener('click', () => handleSendMessage(msgInput.value));

  const renderMessages = (data) => {
    let messages = '';
    data.forEach(
      (message) =>
        (messages += `
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
            <p class="text-light">${message.text}</p>
<button class="btn btn-sm btn-warning edit-btn" data-id="${message.id}">✏️</button>
<button class="btn btn-sm btn-danger delete-btn" data-id="${message.id}">🗑️</button>

        </li>`),
    );
    msgList.innerHTML = messages;
  };
  msgList.querySelectorAll('.edit-btn').forEach((btn) =>
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const newText = prompt('Введите новый текст');
      if (newText) socket.emit('editMessage', { id, text: newText });
    }),
  );

  msgList.querySelectorAll('.delete-btn').forEach((btn) =>
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      socket.emit('deleteMessage', id);
    }),
  );

  const sendMessage = (message) => socket.emit('sendMessage', message);

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
};

app();
