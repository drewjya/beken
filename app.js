import spoonacularRoutes from './Routes/SpoonacularRoute.js'; 
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();


const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(cors());
app.use('/spoonacular', spoonacularRoutes);

app.get('/', (reg, res, next) =>{
    res.json({pesan : "HARI DARI LAPTOP WILLIAM"})
});

app.listen(PORT);