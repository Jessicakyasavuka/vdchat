const WebSocket = require('wss');
const PORT = process.env.PORT || 8080;

const wss = new WebSocket.Server({ port: PORT });
console.log('Serveur WebSocket lancé sur le port', PORT);

const users = new Map(); // username => wss

wss.on('connection', wss => {
  let username = null;

  wss.on('message', msg => {
    const data = JSON.parse(msg);

    if (data.type === 'register') {
      username = data.username;
      users.set(username, wss);
      updateUserList();
    }

    if (data.type === 'offer' || data.type === 'answer' || data.type === 'ice-candidate') {
      const dest = users.get(data.to);
      if (dest) dest.send(JSON.stringify(data));
    }
  });

  wss.on('close', () => {
    if (username) {
      users.delete(username);
      updateUserList();
    }
  });

  function updateUserList() {
    const userList = Array.from(users.keys());
    const payload = JSON.stringify({ type: 'user-list', users: userList });
    users.forEach(client => client.send(payload));
  }
});
