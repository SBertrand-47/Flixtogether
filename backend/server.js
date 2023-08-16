const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3000;

const sessions = {}; // { sessionId: [socket1, socket2, ...], ... }

io.on('connection', (socket) => {
    
console.log('New client connected');
console.log('Total active sessions:', Object.keys(sessions).length);


    socket.on('joinSession', (sessionId) => {
        if (!sessions[sessionId]) {
            sessions[sessionId] = [];
        }
        sessions[sessionId].push(socket);
        
console.log(`Client joined session: ${sessionId}`);
console.log(`Total clients in session ${sessionId}: ${sessions[sessionId].length}`);

    });

    socket.on('videoAction', (data) => {
        const { sessionId, action, value } = data;
        if (sessions[sessionId]) { // Ensure the session exists before attempting to broadcast
            for (let sessionSocket of sessions[sessionId]) {
                if (sessionSocket !== socket) {
                    sessionSocket.emit('videoAction', { action, value });
                }
            }
            
console.log(`Video action "${action}" received for session: ${sessionId}`);
console.log(`Broadcasting action "${action}" to session: ${sessionId}`);

        } else {
            console.log(`No session found with ID: ${sessionId}`);
        }
    });

    socket.on('disconnect', () => {
        
console.log('Client disconnected');
console.log('Active sessions after disconnection:', Object.keys(sessions).length);

        for (let sessionId in sessions) {
            sessions[sessionId] = sessions[sessionId].filter(s => s !== socket);
            if (sessions[sessionId].length === 0) {
                console.log(`Session ${sessionId} is now empty. Cleaning up.`);
                delete sessions[sessionId];
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
