const input = document.getElementById('input');
const output = document.getElementById('output');
const toolbar = document.querySelector('.toolbar');

input.addEventListener('input', updateOutput);
toolbar.addEventListener('click', handleToolbarClick);

function updateOutput() {
    let text = input.value;
    
    // Bold
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    text = text.replace(/_(.*?)_/g, '<em>$1</em>');
    
    // Underline
    text = text.replace(/__(.*?)__/g, '<u>$1</u>');
    
    // Strikethrough
    text = text.replace(/~~(.*?)~~/g, '<s>$1</s>');
    
    // Code blocks
    text = text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    // Inline code
    text = text.replace(/`(.*?)`/g, '<code>$1</code>');
    
    // Block quotes
    text = text.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
    text = text.replace(/^>>> ([\s\S]*?)$/gm, '<blockquote>$1</blockquote>');
    
    // Headers
    text = text.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    text = text.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    text = text.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    
    // Lists
    text = text.replace(/^\* (.+)/gm, '<ul><li>$1</li></ul>');
    text = text.replace(/^- (.+)/gm, '<ul><li>$1</li></ul>');
    
    // Spoilers
    text = text.replace(/\|\|(.*?)\|\|/g, '<span class="spoiler">$1</span>');
    
    // Newlines
    text = text.replace(/\n/g, '<br>');
    
    output.innerHTML = text;
}

function handleToolbarClick(event) {
    if (event.target.tagName === 'BUTTON') {
        const markdown = event.target.getAttribute('data-markdown');
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const selectedText = input.value.substring(start, end);
        
        let replacement;
        if (markdown === '```' || markdown === '> ' || markdown === '# ' || markdown === '- ') {
            replacement = `${markdown}${selectedText}`;
        } else {
            replacement = `${markdown}${selectedText}${markdown}`;
        }
        
        input.value = input.value.substring(0, start) + replacement + input.value.substring(end);
        input.focus();
        input.setSelectionRange(start + markdown.length, end + markdown.length);
        updateOutput();
    }
}

// Initial update
updateOutput();