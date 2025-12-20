require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const homeRoutes = require('./routes/home');
const productionRoutes = require('./routes/production');
const salesRoutes = require('./routes/sales');
 

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes); 
app.use('/api/home', homeRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/sales', salesRoutes);


// CEK SERVER
app.get('/', (req, res) => {
    res.json({message: 'API whadventure berjalan'});
});

app.listen(PORT, () => {
    console.log(`Server runnning on http://localhost:${PORT}`);
});