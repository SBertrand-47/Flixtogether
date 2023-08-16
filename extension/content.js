let videoElement = document.querySelector('video');
let currentSessionId = null;


// Parse the current URL to extract the session ID (if it exists).
const urlParams = new URLSearchParams(window.location.search);
const urlSessionId = urlParams.get('sessionId');

if (urlSessionId) {
    // Inform the background script to join this session.
    chrome.runtime.sendMessage({ type: 'SET_SESSION_ID', data: urlSessionId }, response => {
        console.log(response.status);
    });
}

// Fetch the current session ID when the content script is loaded.

chrome.runtime.sendMessage({ type: 'GET_CURRENT_SESSION' }, response => {
  if (response && response.sessionId) {
    currentSessionId = response.sessionId;
    console.log("Joined session:", currentSessionId);
  }
});

// The background script will notify content script of playback synchronization actions.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'VIDEO_ACTION') {
    const { action, value } = message.data;

    if (action === 'play') {
      videoElement.play();
    } else if (action === 'pause') {
      videoElement.pause();
    }
    // Add more actions here such as 'seek', 'volume' etc. based on your needs.
  }
});

// Listen for playback actions and send them to the background script.
videoElement.addEventListener('play', () => {
  if (currentSessionId) {
    chrome.runtime.sendMessage({
      type: 'VIDEO_ACTION',
      data: { action: 'play' }
    });
  }
});

videoElement.addEventListener('pause', () => {
  if (currentSessionId) {
    chrome.runtime.sendMessage({
      type: 'VIDEO_ACTION',
      data: { action: 'pause' }
    });
  }
});

// If you have more playback actions/events (like seeking, volume change, etc.),
// you can listen for those and send similar messages to the background script.

// Injecting sidebar for active sessions
function injectSidebar() {
    const sidebarContainer = document.createElement('div');
    sidebarContainer.id = 'streamySidebar';
    sidebarContainer.style.position = 'fixed';
    sidebarContainer.style.top = '0';
    sidebarContainer.style.right = '0';
    sidebarContainer.style.width = '200px';
    sidebarContainer.style.height = '100vh';
    sidebarContainer.style.backgroundColor = 'rgba(0,0,0,0.7)';
    sidebarContainer.style.color = 'white';
    sidebarContainer.style.zIndex = '9999';
    sidebarContainer.style.overflowY = 'auto';
    sidebarContainer.style.padding = '10px';
    sidebarContainer.innerHTML = '<h3>Participants</h3><div id="streamyParticipantsList"></div>';

    document.body.appendChild(sidebarContainer);
}

// Update the participant list in the sidebar
function updateParticipantsList(participants) {
    const participantsList = document.getElementById('streamyParticipantsList');
    participantsList.innerHTML = '';
    participants.forEach(participant => {
        const participantItem = document.createElement('div');
        participantItem.innerText = participant;
        participantsList.appendChild(participantItem);
    });
}

// Inject the sidebar when an active session is detected
if (urlSessionId) {
    injectSidebar();
}

// Handle 'updateParticipants' event from the server
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'updateParticipants') {
        updateParticipantsList(message.data);
    }
});
