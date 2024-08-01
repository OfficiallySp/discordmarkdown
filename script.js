const input = document.getElementById('input');
const output = document.getElementById('output');

input.addEventListener('input', updateOutput);

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

// Initial update
updateOutput();