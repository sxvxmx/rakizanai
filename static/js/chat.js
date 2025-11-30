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

    async handleSendMessage() {
        const message = this.userInput.value.trim();
        if (!message) return;

        this.userInput.disabled = true;
        this.sendButton.disabled = true;

        this.addMessage('user', 'You', message);
        this.userInput.value = '';
        this.userInput.style.height = 'auto';

        try {
            const loadingId = this.addLoadingMessage();

            const endpoint = '/api/ask';
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question: message })
            });

            this.removeLoadingMessage(loadingId);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to get response from AI');
            }

            const data = await response.json();
            this.addMessage('bot', 'AI Assistant', data.answer);
        } catch (error) {
            console.error('Error:', error);
            this.removeLoadingMessage();
            this.addMessage('system', 'system', `Error: ${error.message}`);
        } finally {
            this.userInput.disabled = false;
            this.sendButton.disabled = false;
            this.scrollToBottom();
        }
    }

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