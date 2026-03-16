const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend is running on Amazon Linux with Docker!',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/items', (req, res) => {
  res.json({
    items: [
      { id: 1, name: 'Item One', status: 'active' },
      { id: 2, name: 'Item Two', status: 'active' },
      { id: 3, name: 'Item Three', status: 'pending' }
    ]
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('Backend running on port ' + PORT);
});
