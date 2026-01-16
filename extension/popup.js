const API_URL = 'http://localhost:3000';

let currentUrl = '';
let currentTitle = '';
let tags = [];

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  const token = await getToken();
  
  if (!token) {
    showLoginPrompt();
    return;
  }

  // Get current tab info
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      currentUrl = tabs[0].url;
      currentTitle = tabs[0].title;
      
      document.getElementById('url-display').textContent = currentUrl;
      document.getElementById('title').value = currentTitle;
    }
  });

  // Setup event listeners
  setupEventListeners();
});

function setupEventListeners() {
  const noteInput = document.getElementById('note');
  const charCount = document.getElementById('charCount');
  const tagInput = document.getElementById('tagInput');
  const addTagBtn = document.getElementById('addTagBtn');
  const saveBtn = document.getElementById('saveBtn');

  // Note character count
  noteInput.addEventListener('input', () => {
    charCount.textContent = noteInput.value.length;
  });

  // Add tag on button click
  addTagBtn.addEventListener('click', addTag);

  // Add tag on Enter key
  tagInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  });

  // Save bookmark
  saveBtn.addEventListener('click', saveBookmark);
}

function addTag() {
  const tagInput = document.getElementById('tagInput');
  const tagName = tagInput.value.trim();

  if (!tagName) {
    return;
  }

  if (tags.length >= 5) {
    showError('Maximum 5 tags allowed');
    return;
  }

  if (tags.some(t => t.toLowerCase() === tagName.toLowerCase())) {
    showError('Tag already added');
    return;
  }

  tags.push(tagName);
  tagInput.value = '';
  renderTags();
  clearError();
}

function removeTag(tagName) {
  tags = tags.filter(t => t !== tagName);
  renderTags();
}

function renderTags() {
  const tagList = document.getElementById('tagList');
  tagList.innerHTML = '';

  tags.forEach(tag => {
    const tagEl = document.createElement('span');
    tagEl.className = 'tag';
    tagEl.innerHTML = `
      ${tag}
      <button type="button" onclick="removeTag('${tag.replace(/'/g, "\\'")}')">×</button>
    `;
    tagList.appendChild(tagEl);
  });
}

async function saveBookmark() {
  const title = document.getElementById('title').value.trim();
  const note = document.getElementById('note').value.trim();
  const saveBtn = document.getElementById('saveBtn');

  // Validation
  if (!currentUrl || !title) {
    showError('URL and title are required');
    return;
  }

  if (!note) {
    showError('Note is required');
    return;
  }

  if (note.length > 200) {
    showError('Note must be 200 characters or less');
    return;
  }

  if (tags.length > 5) {
    showError('Maximum 5 tags allowed');
    return;
  }

  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';

  try {
    const token = await getToken();
    const response = await fetch(`${API_URL}/api/bookmarks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        url: currentUrl,
        title,
        note,
        tags,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save bookmark');
    }

    showSuccess('Bookmark saved successfully!');
    setTimeout(() => {
      window.close();
    }, 1500);
  } catch (err) {
    showError(err.message);
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Bookmark';
  }
}

function showError(message) {
  const messageDiv = document.getElementById('message');
  messageDiv.className = 'error';
  messageDiv.textContent = message;
  messageDiv.style.display = 'block';
}

function showSuccess(message) {
  const messageDiv = document.getElementById('message');
  messageDiv.className = 'success';
  messageDiv.textContent = message;
  messageDiv.style.display = 'block';
}

function clearError() {
  const messageDiv = document.getElementById('message');
  messageDiv.style.display = 'none';
}

function showLoginPrompt() {
  document.getElementById('captureForm').style.display = 'none';
  document.getElementById('loginPrompt').style.display = 'block';
}

async function getToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['devmarkToken'], (result) => {
      resolve(result.devmarkToken || null);
    });
  });
}

// Make removeTag available globally
window.removeTag = removeTag;
