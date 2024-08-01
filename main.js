const input = document.getElementById('input');
const output = document.getElementById('output');
const charCount = document.getElementById('char-count');
const copyBtn = document.getElementById('copy-btn');
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const undoBtn = document.getElementById('undo-btn');
const redoBtn = document.getElementById('redo-btn');
let undoStack = [];
let redoStack = [];

themeToggle.addEventListener('click', () => {
    body.classList.toggle('light-theme');
});

input.addEventListener('input', updateOutput);
input.addEventListener('input', updateCharCount);
input.addEventListener('input', () => {
    undoStack.push(input.value);
    redoStack = [];
});

undoBtn.addEventListener('click', () => {
    if (undoStack.length > 1) {
        redoStack.push(undoStack.pop());
        input.value = undoStack[undoStack.length - 1];
        updateOutput();
        updateCharCount();
    }
});

redoBtn.addEventListener('click', () => {
    if (redoStack.length > 0) {
        undoStack.push(redoStack.pop());
        input.value = undoStack[undoStack.length - 1];
        updateOutput();
        updateCharCount();
    }
});

function updateOutput() {
    let text = input.value;
    text = text.replace(/\n/g, '<br>');
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    text = text.replace(/\_(.*?)\_/g, '<u>$1</u>');
    text = text.replace(/\~\~(.*?)\~\~/g, '<s>$1</s>');
    text = text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    text = text.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
    text = text.replace(/^>>> ([\s\S]*?)$/gm, '<blockquote>$1</blockquote>');
    text = text.replace(/\|\|(.*?)\|\|/g, '<span class="spoiler">$1</span>');
    text = text.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    text = text.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    text = text.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    text = text.replace(/^-# (.+)$/gm, '<sub>$1</sub>');
    text = text.replace(/^\* (.+)$/gm, '<li>$1</li>');
    text = text.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>');
    text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        if (lang && hljs.getLanguage(lang)) {
            return `<pre><code class="hljs ${lang}">${hljs.highlight(code, {language: lang, ignoreIllegals: true}).value}</code></pre>`;
        }
        return `<pre><code>${hljs.highlightAuto(code).value}</code></pre>`;
    });
    output.innerHTML = text;
    document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightBlock(block);
    });
}

const MAX_CHAR_COUNT = 2000;
const NITRO_MAX_CHAR_COUNT = 4000;

let isNitro = false; // You can add a toggle for this in the UI if needed

function updateCharCount() {
    const text = input.value;
    const count = text.replace(/\n/g, '\r\n').length;
    const maxCount = isNitro ? NITRO_MAX_CHAR_COUNT : MAX_CHAR_COUNT;
    charCount.textContent = `${count} / ${maxCount}`;
    charCount.style.color = count > maxCount ? 'red' : '';
}

copyBtn.addEventListener('click', () => {
    const formattedText = input.value;
    navigator.clipboard.writeText(formattedText).then(() => {
        alert('Copied to clipboard!');
    });
});

function applyFormat(format) {
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const selectedText = input.value.substring(start, end);
    let formattedText = '';

    switch (format) {
        case 'bold':
            formattedText = `**${selectedText}**`;
            break;
        case 'italic':
            formattedText = `*${selectedText}*`;
            break;
        case 'underline':
            formattedText = `__${selectedText}__`;
            break;
        case 'strikethrough':
            formattedText = `~~${selectedText}~~`;
            break;
        case 'inlineCode':
            formattedText = `\`${selectedText}\``;
            break;
        case 'codeblock':
            formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
            break;
        case 'quote':
            formattedText = `> ${selectedText}`;
            break;
        case 'multiQuote':
            formattedText = `>>> ${selectedText}`;
            break;
        case 'spoiler':
            formattedText = `||${selectedText}||`;
            break;
        case 'header1':
            formattedText = `# ${selectedText}`;
            break;
        case 'header2':
            formattedText = `## ${selectedText}`;
            break;
        case 'header3':
            formattedText = `### ${selectedText}`;
            break;
        case 'subtext':
            formattedText = `-# ${selectedText}`;
            break;
        case 'bulletList':
            formattedText = `* ${selectedText}`;
            break;
        case 'maskedLink':
            const url = prompt("Enter the URL:");
            if (url) {
                formattedText = `[${selectedText}](${url})`;
            } else {
                return;
            }
            break;
    }

    input.value = input.value.substring(0, start) + formattedText + input.value.substring(end);
    input.focus();
    updateOutput();
}

const toggleCheatsheet = document.getElementById('toggle-cheatsheet');
const cheatsheet = document.getElementById('cheatsheet');

toggleCheatsheet.addEventListener('click', () => {
    cheatsheet.classList.toggle('show');
});

const nitroToggle = document.getElementById('nitro-toggle');

nitroToggle.addEventListener('click', () => {
    isNitro = !isNitro;
    nitroToggle.textContent = isNitro ? 'Disable Nitro Character Limit' : 'Enable Nitro Character Limit';
    updateCharCount();
});

const saveTemplateBtn = document.getElementById('save-template');
const loadTemplateSelect = document.getElementById('load-template');
const templateNameInput = document.getElementById('template-name');

saveTemplateBtn.addEventListener('click', () => {
    const name = templateNameInput.value;
    const content = input.value;
    if (name && content) {
        localStorage.setItem(`template_${name}`, content);
        updateTemplateList();
    }
});

loadTemplateSelect.addEventListener('change', () => {
    const selectedTemplate = loadTemplateSelect.value;
    if (selectedTemplate) {
        input.value = localStorage.getItem(selectedTemplate);
        updateOutput();
        updateCharCount();
    }
});

function updateTemplateList() {
    loadTemplateSelect.innerHTML = '<option value="">Load Template</option>';
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('template_')) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = key.replace('template_', '');
            loadTemplateSelect.appendChild(option);
        }
    }
}

updateTemplateList();

const emojiButton = document.getElementById('emoji-button');
const emojiPicker = document.getElementById('emoji-picker');

emojiButton.addEventListener('click', () => {
    emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'block' : 'none';
});

emojiPicker.addEventListener('emoji-click', event => {
    input.value += event.detail.unicode;
    updateOutput();
    updateCharCount();
});

function previewEmbed(url) {
    fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`)
        .then(response => response.json())
        .then(data => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(data.contents, 'text/html');
            const title = doc.querySelector('meta[property="og:title"]')?.content || '';
            const description = doc.querySelector('meta[property="og:description"]')?.content || '';
            const image = doc.querySelector('meta[property="og:image"]')?.content || '';
            
            const embedPreview = `
                <div class="embed-preview">
                    <h3>${title}</h3>
                    <p>${description}</p>
                    ${image ? `<img src="${image}" alt="Preview image">` : ''}
                </div>
            `;
            output.insertAdjacentHTML('beforeend', embedPreview);
        });
}

function formatTimestamp(timestamp, format) {
    const date = new Date(timestamp * 1000);
    return `<t:${Math.floor(date.getTime() / 1000)}:${format}>`;
}

function applyTimestamp() {
    const timestamp = Math.floor(Date.now() / 1000);
    const format = prompt('Enter timestamp format (t, T, d, D, f, F, R):');
    if (format) {
        const formattedTimestamp = formatTimestamp(timestamp, format);
        input.value += formattedTimestamp;
        updateOutput();
        updateCharCount();
    }
}

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'b': applyFormat('bold'); break;
            case 'i': applyFormat('italic'); break;
            case 'u': applyFormat('underline'); break;
            case 'k': applyFormat('spoiler'); break;
            // Add more shortcuts as needed
        }
        e.preventDefault();
    }
});

updateOutput();