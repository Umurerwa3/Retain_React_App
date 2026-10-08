import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL?.split(',') ?? '*',
  })
);
app.use(express.json());
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default app;
