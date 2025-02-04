const express = require('express');
const path = require('path');
const EventEmitter = require('events');
const url = require('url');

const app = express();
const port = process.env.PORT || 3000;
const chatEmitter = new EventEmitter();

// Function to respond with plain text
function respondText(req, res) {
  res.type('text/plain');
  res.send('hi');
}

// Function to respond with JSON
function respondJson(req, res) {
  res.json({
    text: 'hi',
    numbers: [1, 2, 3],
  });
}

// Function to echo input from query parameters
function respondEcho(req, res) {
  const { input = '' } = req.query;
  res.json({
    normal: input,
    shouty: input.toUpperCase(),
    charCount: input.length,
    backwards: input.split('').reverse().join(''),
  });
}

// Function to handle chat messages
function respondChat(req, res) {
  const { message } = req.query;
  if (message) chatEmitter.emit('message', message);
  res.end();
}

// Function to handle Server-Sent Events (SSE)
function respondSSE(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  const onMessage = message => res.write(`data: ${message}\n\n`);
  chatEmitter.on('message', onMessage);

  res.on('close', () => {
    chatEmitter.off('message', onMessage);
  });
}

// Serve the chat.html file at the root route
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '/chat.html')));

// Define routes
app.get('/json', respondJson);
app.get('/echo', respondEcho);
app.get('/chat', respondChat);
app.get('/sse', respondSSE);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});