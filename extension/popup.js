// Function to update the UI based on session existence
function updateUI(sessionId, currentUrl) {
    const inviteLinkContainer = document.querySelector('.inviteLink');
    const createSessionButton = document.getElementById('createSession');
    const sessionIdDisplay = document.getElementById('sessionIdDisplay');
    const inviteURLTextarea = document.getElementById('inviteURL');

    if (sessionId) {
        inviteLinkContainer.style.display = 'block';
        createSessionButton.style.display = 'none';
        const inviteLink = `${currentUrl}?sessionId=${sessionId}`;
        inviteURLTextarea.value = inviteLink;
    } else {
        inviteLinkContainer.style.display = 'none';
        createSessionButton.style.display = 'block';
        sessionIdDisplay.innerText = '';
    }
}

// On popup load, ask the background for the current session ID
chrome.runtime.sendMessage({ type: 'GET_SESSION_ID' }, response => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const currentUrl = tabs[0].url;
        updateUI(response.sessionId, currentUrl);
    });
});

document.getElementById('createSession').addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const currentUrl = tabs[0].url;

        // Send a message to the background script to initiate a new session.
        chrome.runtime.sendMessage({ type: 'CREATE_NEW_SESSION' }, response => {
            updateUI(response.sessionId, currentUrl);
        });
    });
});
