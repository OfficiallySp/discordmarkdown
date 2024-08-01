const input = document.getElementById('input');
const output = document.getElementById('output');
const charCount = document.getElementById('char-count');
const copyBtn = document.getElementById('copy-btn');
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const undoBtn = document.getElementById('undo-btn');
const redoBtn = document.getElementById('redo-btn');
const timestampBtn = document.getElementById('timestamp-btn');
const timestampModal = document.getElementById('timestamp-modal');
let undoStack = [];
let redoStack = [];

const MAX_CHAR_COUNT = 2000;
const NITRO_MAX_CHAR_COUNT = 4000;
let isNitro = false;
const MAX_UNDO_STACK_SIZE = 100; // Adjust this value as needed

// Event Listeners
themeToggle.addEventListener('click', () => body.classList.toggle('light-theme'));
input.addEventListener('input', handleInput);
undoBtn.addEventListener('click', undo);
redoBtn.addEventListener('click', redo);
copyBtn.addEventListener('click', copyToClipboard);
timestampBtn.addEventListener('click', openTimestampModal);

document.getElementById('toggle-cheatsheet').addEventListener('click', toggleCheatsheet);
document.getElementById('nitro-toggle').addEventListener('click', toggleNitro);
document.getElementById('save-template').addEventListener('click', saveTemplate);
document.getElementById('load-template').addEventListener('change', loadTemplate);
document.getElementById('remove-template').addEventListener('click', removeTemplate);

// Timestamp Modal Event Listeners
document.getElementById('close-timestamp-modal').addEventListener('click', closeTimestampModal);
document.addEventListener('DOMContentLoaded', () => {
    const timestampGrid = document.querySelector('.timestamp-grid');
    timestampGrid.addEventListener('click', (e) => {
        if (e.target.matches('button[data-format]')) {
            insertTimestamp(e.target.dataset.format);
        }
    });

    document.getElementById('insert-custom-timestamp').addEventListener('click', insertCustomTimestamp);
});

// Main functions
function handleInput() {
    updateOutput();
    updateCharCount();
    undoStack.push(input.value);
    if (undoStack.length > MAX_UNDO_STACK_SIZE) {
        undoStack.shift(); // Remove the oldest item
    }
    redoStack = [];
}

function updateOutput() {
    let text = input.value;
    // ... (keep your existing text replacement logic here)
    
    // Add this section to handle timestamp formatting
    text = text.replace(/<t:(\d+):([tTdDfFR])>/g, (match, timestamp, format) => {
        const date = new Date(timestamp * 1000);
        switch (format) {
            case 't': return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            case 'T': return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
            case 'd': return date.toLocaleDateString();
            case 'D': return date.toLocaleDateString([], {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'});
            case 'f': return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
            case 'F': return date.toLocaleString([], {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit'});
            case 'R': return timeAgo(date);
            default: return match;
        }
    });
    
    output.innerHTML = text;
    document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightBlock(block);
    });
}

// Add this helper function for relative time
function timeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    const intervals = [
        { label: 'year', seconds: 31536000 },
        { label: 'month', seconds: 2592000 },
        { label: 'week', seconds: 604800 },
        { label: 'day', seconds: 86400 },
        { label: 'hour', seconds: 3600 },
        { label: 'minute', seconds: 60 },
        { label: 'second', seconds: 1 }
    ];
    for (let i = 0; i < intervals.length; i++) {
        const interval = intervals[i];
        const count = Math.floor(seconds / interval.seconds);
        if (count >= 1) {
            return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
        }
    }
    return 'just now';
}

function updateCharCount() {
    const count = input.value.replace(/\n/g, '\r\n').length;
    const maxCount = isNitro ? NITRO_MAX_CHAR_COUNT : MAX_CHAR_COUNT;
    charCount.textContent = `${count} / ${maxCount}`;
    charCount.style.color = count > maxCount ? 'red' : (isNitro ? '#ff73fa' : '');
}

function applyFormat(format) {
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const selectedText = input.value.substring(start, end);
    let formattedText = '';

    switch (format) {
        case 'bold': formattedText = `**${selectedText}**`; break;
        case 'italic': formattedText = `*${selectedText}*`; break;
        case 'underline': formattedText = `__${selectedText}__`; break;
        case 'strikethrough': formattedText = `~~${selectedText}~~`; break;
        case 'inlineCode': formattedText = `\`${selectedText}\``; break;
        case 'codeblock': formattedText = `\`\`\`\n${selectedText}\n\`\`\``; break;
        case 'quote': formattedText = `> ${selectedText}`; break;
        case 'multiQuote': formattedText = `>>> ${selectedText}`; break;
        case 'spoiler': formattedText = `||${selectedText}||`; break;
        case 'header1': formattedText = `# ${selectedText}`; break;
        case 'header2': formattedText = `## ${selectedText}`; break;
        case 'header3': formattedText = `### ${selectedText}`; break;
        case 'subtext': formattedText = `-# ${selectedText}`; break;
        case 'bulletList': formattedText = `* ${selectedText}`; break;
        case 'maskedLink':
            const url = prompt("Enter the URL:");
            formattedText = url ? `[${selectedText}](${url})` : selectedText;
            break;
    }

    input.value = input.value.substring(0, start) + formattedText + input.value.substring(end);
    input.focus();
    handleInput();
}

// Timestamp functions
function openTimestampModal() {
    console.log('Opening timestamp modal'); // Debug log
    timestampModal.style.display = 'block';
    const now = new Date();
    document.getElementById('custom-date-picker').value = now.toISOString().slice(0, 16);
}

function closeTimestampModal() {
    console.log('Closing timestamp modal'); // Debug log
    timestampModal.style.display = 'none';
}

function insertTimestamp(format) {
    console.log('Inserting timestamp with format:', format); // Debug log
    const timestamp = Math.floor(Date.now() / 1000);
    insertTextAtCursor(`<t:${timestamp}:${format}>`);
    closeTimestampModal();
    updateOutput(); // Add this line
}

function insertCustomTimestamp() {
    console.log('Inserting custom timestamp'); // Debug log
    const date = document.getElementById('custom-date-picker').value;
    const format = document.getElementById('custom-date-format').value;
    const timestamp = Math.floor(new Date(date).getTime() / 1000);
    insertTextAtCursor(`<t:${timestamp}:${format}>`);
    closeTimestampModal();
    updateOutput(); // Add this line
}

function insertTextAtCursor(text) {
    const cursorPos = input.selectionStart;
    const textBefore = input.value.substring(0, cursorPos);
    const textAfter = input.value.substring(cursorPos);
    input.value = textBefore + text + textAfter;
    input.selectionStart = input.selectionEnd = cursorPos + text.length; // Add this line
    handleInput();
}

// Utility functions
function undo() {
    if (undoStack.length > 1) {
        redoStack.push(undoStack.pop());
        input.value = undoStack[undoStack.length - 1];
        handleInput();
    }
}

function redo() {
    if (redoStack.length > 0) {
        undoStack.push(redoStack.pop());
        input.value = undoStack[undoStack.length - 1];
        handleInput();
    }
}

function copyToClipboard() {
    navigator.clipboard.writeText(input.value).then(() => {
        alert('Copied to clipboard!');
    });
}

function toggleCheatsheet() {
    document.getElementById('cheatsheet').classList.toggle('show');
}

function toggleNitro() {
    isNitro = !isNitro;
    const maxCount = isNitro ? NITRO_MAX_CHAR_COUNT : MAX_CHAR_COUNT;
    charCount.textContent = `${input.value.replace(/\n/g, '\r\n').length} / ${maxCount}`;
    updateCharCount();
}

// Template functions
function saveTemplate() {
    const name = document.getElementById('template-name').value;
    const content = input.value;
    if (name && content) {
        localStorage.setItem(`template_${name}`, content);
        updateTemplateList();
    }
}

function loadTemplate() {
    const selectedTemplate = document.getElementById('load-template').value;
    if (selectedTemplate) {
        input.value = localStorage.getItem(selectedTemplate);
        handleInput();
    }
}

function removeTemplate() {
    const select = document.getElementById('load-template');
    const selectedTemplate = select.value;
    
    if (selectedTemplate) {
        localStorage.removeItem(selectedTemplate);
        select.remove(select.selectedIndex);
        if (select.value === '') {
            input.value = '';
            handleInput();
        }
        alert(`Template "${selectedTemplate.replace('template_', '')}" has been removed.`);
    } else {
        alert('Please select a template to remove.');
    }
}

function updateTemplateList() {
    const select = document.getElementById('load-template');
    select.innerHTML = '<option value="">Load Template</option>';
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('template_')) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = key.replace('template_', '');
            select.appendChild(option);
        }
    }
}

// Initialize
updateTemplateList();
updateOutput();

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'b': applyFormat('bold'); break;
            case 'i': applyFormat('italic'); break;
            case 'u': applyFormat('underline'); break;
            case 'k': applyFormat('spoiler'); break;
            default: return;
        }
        e.preventDefault();
    }
});