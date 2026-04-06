import express from 'express';
import process from 'process';
const app = express();

app.get('/config', (_, res) => {
  res.json({ API_URL: process.env.API_URL });
});

app.use(express.static('.'));
app.listen(3000);
