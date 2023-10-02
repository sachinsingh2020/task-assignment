import express from 'express';
import { config } from 'dotenv';
import ErrorMiddleware from './middlewares/Error.js';

config({
    path: "./config/config.env",
});

const app = express();

app.use(express.json());

// importing routes here
import blog from './routes/blogRoute.js';

app.use('/api', blog);


app.get('/', (req, res) => {
    res.send('<h1>Server Is Working</h1>');
})

export default app;

app.use(ErrorMiddleware);

