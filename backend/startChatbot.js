const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

let chatbotProcess = null;

function startChatbot() {
  console.log('\n🤖 Starting AI Chatbot Server...');
  
  const chatbotPath = path.join(__dirname, 'chatbot');
  const pythonScript = path.join(chatbotPath, 'simple_chat.py');
  
  // Check for virtual environment Python
  const venvPython = path.join(__dirname, '..', '.venv', 'Scripts', 'python.exe');
  const pythonCommand = fs.existsSync(venvPython) ? venvPython : 'python';
  
  if (fs.existsSync(venvPython)) {
    console.log('✓ Using virtual environment Python');
  } else {
    console.log('⚠ Using system Python (venv not found)');
  }
  
  // Start Python chatbot process
  chatbotProcess = spawn(pythonCommand, [pythonScript], {
    cwd: chatbotPath,
    stdio: 'inherit' // Show output in same console
  });

  chatbotProcess.on('error', (error) => {
    console.error('❌ Failed to start chatbot:', error.message);
    console.log('💡 Make sure Python is installed and in PATH');
  });

  chatbotProcess.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.log(`\n⚠️  Chatbot process exited with code ${code}`);
    }
  });

  console.log('✅ Chatbot server starting on http://127.0.0.1:5001\n');
}

function stopChatbot() {
  if (chatbotProcess) {
    console.log('\n🛑 Stopping chatbot server...');
    chatbotProcess.kill();
    chatbotProcess = null;
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🔴 Shutting down servers...');
  stopChatbot();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopChatbot();
  process.exit(0);
});

module.exports = { startChatbot, stopChatbot };
