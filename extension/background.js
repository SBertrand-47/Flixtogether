importScripts('socket.io.js');

let socket = null; // Initialize to null
let currentSessionId = null;

// Function to connect to socket.io server
function connectToServer() {
  if (typeof io !== 'undefined') {
    socket = io('http://localhost:3000'); // Connect to the server

    // If you have any global socket event listeners, you can add them here.
  } else {
    
console.error('Socket.io client library is not loaded.');

  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!socket) {
    connectToServer(); // Attempt to connect if not connected
  }

  if (message.type === 'CREATE_NEW_SESSION') {
    currentSessionId = "SESSION_" + Math.random().toString(36).substr(2, 9);

    // Join the session on the server
    socket.emit('joinSession', currentSessionId);

    
sendResponse({ sessionId: currentSessionId });
console.log('New session created with ID:', currentSessionId);

  } else if (message.type === 'SET_SESSION_ID') {
    currentSessionId = message.data;

    // Join the session on the server
    socket.emit('joinSession', currentSessionId);

    
sendResponse({ status: 'Session ID updated successfully.' });
console.log('Session ID updated to:', currentSessionId);

  } else if (message.type === 'GET_SESSION_ID') {
    
sendResponse({ sessionId: currentSessionId });
console.log('New session created with ID:', currentSessionId);

  } else if (message.type === 'VIDEO_ACTION') {
    const { action, value } = message.data;

    // Forward the video action to the server
    socket.emit('videoAction', { sessionId: currentSessionId, action, value });

    
sendResponse({ status: 'Action forwarded to server.' });
console.log('Video action', action, 'forwarded to server for session:', currentSessionId);

  }
});

// Try to connect on background script startup
connectToServer();
