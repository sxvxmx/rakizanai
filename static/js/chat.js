class ChatApp {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.userInput = document.getElementById('userInput');
        this.sendButton = document.getElementById('sendButton');
        this.isAdvancedMode = true;

        this.initializeEventListeners();
        this.setupAutoResize();
    }

    initializeEventListeners() {
        this.sendButton.addEventListener('click', () => this.handleSendMessage());
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSendMessage();
            }
        });
    }

    setupAutoResize() {
        this.userInput.addEventListener('input', () => {
            this.userInput.style.height = 'auto';
            this.userInput.style.height = Math.min(this.userInput.scrollHeight, 150) + 'px';
        });
    }

    // ---------- streaming-capable send handler ----------
    async handleSendMessage() {
        const message = this.userInput.value.trim();
        if (!message) return;

        this.userInput.disabled = true;
        this.sendButton.disabled = true;

        this.addMessage('user', 'You', message);
        this.userInput.value = '';
        this.userInput.style.height = 'auto';

        const endpoint = '/api/ask_stream'; // POST + ReadableStream endpoint
        const controller = new AbortController();

        // create a streaming bot message element to update as tokens arrive
        const botElem = this.addStreamingBotMessage('AI Assistant');

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: message }),
                signal: controller.signal
            });

            if (!res.ok) {
                // try to parse JSON error, else throw text
                let errText = `HTTP ${res.status}`;
                try {
                    const errJson = await res.json();
                    errText = errJson.error || JSON.stringify(errJson);
                } catch (e) {
                    try { errText = await res.text(); } catch (_) {}
                }
                throw new Error(errText);
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let done = false;

            while (!done) {
                const { value, done: streamDone } = await reader.read();
                if (streamDone) break;
                buffer += decoder.decode(value, { stream: true });

                // split on newline for ndjson framing
                const lines = buffer.split('\n');
                buffer = lines.pop(); // incomplete line

                for (const line of lines) {
                    if (!line.trim()) continue;
                    let obj;
                    try {
                        obj = JSON.parse(line);
                    } catch (e) {
                        // ignore parse errors for partial or malformed lines
                        console.warn('Failed to parse line:', line);
                        continue;
                    }

                    if (obj.error) {
                        // model/backend signaled an error
                        throw new Error(obj.error);
                    }

                    if (obj.done) {
                        done = true;
                        break;
                    }

                    if (obj.token !== undefined) {
                        // append token to bot message
                        this.appendTokenToBotMessage(botElem, obj.token);
                    } else if (obj.text !== undefined) {
                        // some streams use "text" key instead of "token"
                        this.appendTokenToBotMessage(botElem, obj.text);
                    }
                }

                this.scrollToBottom();
            }

            // flush any leftover buffer that might contain a final JSON object
            if (buffer.trim()) {
                try {
                    const obj = JSON.parse(buffer);
                    if (obj.token) this.appendTokenToBotMessage(botElem, obj.token);
                    if (obj.done) done = true;
                } catch (_) {
                    // ignore
                }
            }

            // finalize message (no-op visually, but keeps API consistent)
            this.finishStreamingBotMessage(botElem);
        } catch (error) {
            console.error('Streaming error:', error);
            // remove streaming message and show error system message
            if (botElem && botElem.closest('.message')) botElem.closest('.message').remove();
            this.addMessage('system', 'system', `Error: ${error.message}`);
        } finally {
            this.userInput.disabled = false;
            this.sendButton.disabled = false;
            this.scrollToBottom();
        }
    }

    // ---------- helpers for streaming UI ----------
    addStreamingBotMessage(sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message bot-message`;

        // content container: keep a paragraph <p> with an id for updates
        const contentId = `bot-content-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        messageDiv.innerHTML = `
            <div class="content">
                <h3>${sender}</h3>
                <p id="${contentId}"></p>
            </div>
        `;
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        return document.getElementById(contentId);
    }

    appendTokenToBotMessage(botContentElem, token) {
        // tokens can be partial; keep raw text in dataset to avoid repeated HTML to plain conversions
        if (!botContentElem.dataset.raw) botContentElem.dataset.raw = '';
        botContentElem.dataset.raw += token;

        // format the current raw text for display (markdown-like handling + newlines)
        const formatted = this.formatMessage(botContentElem.dataset.raw);
        botContentElem.innerHTML = formatted;
    }

    finishStreamingBotMessage(botContentElem) {
        // optional: perform any final formatting or cleanup
        // ensure dataset.raw exists
        if (botContentElem && !botContentElem.dataset.raw) botContentElem.dataset.raw = '';
        // already formatted in appendTokenToBotMessage; nothing more needed
    }

    // ---------- existing methods preserved ----------
    addMessage(type, sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;

        messageDiv.innerHTML = `
            <div class="content">
                <h3>${sender}</h3>
                <p>${this.formatMessage(text)}</p>
            </div>
        `;

        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    formatMessage(text) {
        return text
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }

    addLoadingMessage() {
        const loadingId = Date.now();
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message bot-message';
        loadingDiv.id = `loading-${loadingId}`;
        loadingDiv.innerHTML = `
            <div class="content">
                <h3>AI Assistant</h3>
                <div class="loading">
                    <div class="spinner"></div>
                    <span>Thinking...</span>
                </div>
            </div>
        `;

        this.chatMessages.appendChild(loadingDiv);
        this.scrollToBottom();
        return loadingId;
    }

    removeLoadingMessage(loadingId) {
        const loadingElement = document.getElementById(`loading-${loadingId}`);
        if (loadingElement) {
            loadingElement.remove();
        } else {
            const loadingElements = this.chatMessages.querySelectorAll('.loading');
            loadingElements.forEach(el => el.closest('.message').remove());
        }
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
});

document.addEventListener('submit', (e) => {
    if (e.target.tagName === 'FORM') {
        e.preventDefault();
    }
});
