require('dotenv').config();
console.log('Env Check -> OpenAI:', !!process.env.OPENAI_API_KEY, '| Supabase:', !!process.env.SUPABASE_URL);

process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (reason, p) => {
    console.error('UNHANDLED REJECTION:', reason);
});

const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

const routes = require('./routes');
app.use('/api', routes);

app.get('/', (req, res) => res.send('Necookie API Running'));

const PORT = 5000;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));