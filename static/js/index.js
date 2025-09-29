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
            <span class="text-info">