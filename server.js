import http from 'http';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { askGemini } from './gemini.js';
import { config } from 'dotenv';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET') {
    
    const filePath = req.url === '/' ? 'index.html' : req.url;
    const ext = path.extname(filePath);

    const contentType = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'text/javascript',
      '.json': 'application/json'
    }[ext] || 'text/plain';

    try {
      const content = await readFile(path.join(__dirname, filePath));
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    } catch (err) {
      res.writeHead(404);
      res.end('File not found');
    }
  }

  if (req.method === 'POST' && req.url === '/ask') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      const { question } = JSON.parse(body);
      const answer = await askGemini(question);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ answer }));
    });
  }
});

const PORT= process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running at PORT ${ PORT }`);
});
