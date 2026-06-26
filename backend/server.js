const express = require('express');
const cors = require('cors');
const solveRouter = require('./routes/solve');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.use('/api', solveRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Drone Fleet Simulator backend running on http://localhost:${PORT}`);
});
