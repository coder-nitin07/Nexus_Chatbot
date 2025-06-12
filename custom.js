const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const chatBox = document.getElementById('chatBox');

chatForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const question = userInput.value.trim();
  if (!question) return;

  addMessage('user', question);
  getBotResponse(question.toLowerCase());
  userInput.value = '';
});

function addMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('chat-message', sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function getBotResponse(userQuestion) {
  const typingDiv = document.createElement('div');
  typingDiv.classList.add('chat-message', 'bot', 'typing');
  typingDiv.textContent = 'Chatbot is thinking...';
  chatBox.appendChild(typingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  const aiReply = await getGeminiAnswer(userQuestion);
  chatBox.removeChild(typingDiv);
  addMessage('bot', aiReply);
}

async function getGeminiAnswer(question) {
  try {
    const response = await fetch('/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ question })
    });

    const data = await response.json();
    return data.answer || "Sorry, no response from Gemini.";
  } catch (err) {
    return "Error: Unable to reach the server.";
  }
}