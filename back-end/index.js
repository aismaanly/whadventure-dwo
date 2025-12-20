require('dotenv').config();
const express = require('express');
const cors = require('cors');

const salesRoutes = require('./routes/sales');
const productionRoutes = require('./routes/production');
const authRoutes = require('./routes/auth'); 

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/sales', salesRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/auth', authRoutes); 

// CEK SERVER
app.get('/', (req, res) => {
    res.json({message: 'API whadventure berjalan'});
});

app.listen(PORT, () => {
    console.log(`Server runnning on http://localhost:${PORT}`);
});