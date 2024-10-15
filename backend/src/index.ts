import http from 'http';

const hostname = '0.0.0.0';
const port = 5000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello, TypeScript!\n');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

/**
 * 
 * import "reflect-metadata";
  import { createConnection } from 'typeorm';
  import express from 'express';
  import userRoutes from './routes/userRoutes';

  createConnection().then(async connection => {
    const app = express();
    app.use(express.json());

    // Kullanıcı rotalarını kullan
    app.use('/api', userRoutes);

    app.listen(3000, () => {
      console.log('Server is running on http://localhost:3000');
    });
  }).catch(error => console.log(error));

 */