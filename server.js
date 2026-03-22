// 1. Load configuration from .env
require('dotenv').config(); 

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();

// 2. Middleware setup
app.use(cors()); // Allows frontend/backend communication
app.use(express.json()); // Parses JSON data from your forms

// 3. Serve Frontend
// This tells Node to look inside the 'public' folder for your index.html
app.use(express.static(path.join(__dirname, 'public')));

// 4. MySQL Connection Pool
// It pulls the values from your .env (including your quoted password)
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Hardcoded for your project demo (matches the ID 1 we created in SQL)
const CURRENT_USER_ID = 1;

// ==========================================
// CRUD API ENDPOINTS
// ==========================================

// READ: Get all movies
app.get('/api/movies', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM watchlist WHERE user_id = ? ORDER BY watch_date DESC',
            [CURRENT_USER_ID]
        );
        res.json(rows);
    } catch (err) {
        console.error("Fetch Error:", err);
        res.status(500).json({ error: "Database fetch failed" });
    }
});

// CREATE: Add a new movie
app.post('/api/movies', async (req, res) => {
    const { title, genre, rating, watch_date, runtime } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO watchlist (user_id, title, genre, rating, watch_date, runtime) VALUES (?, ?, ?, ?, ?, ?)',
            [CURRENT_USER_ID, title, genre, rating, watch_date, runtime]
        );
        res.status(201).json({ id: result.insertId, message: "Movie Added" });
    } catch (err) {
        console.error("Insert Error:", err);
        res.status(500).json({ error: "Database insert failed" });
    }
});

// UPDATE: Edit Rating/Review
app.put('/api/movies/:id', async (req, res) => {
    const { id } = req.params;
    const { rating, review } = req.body;
    try {
        await pool.query(
            'UPDATE watchlist SET rating = ?, review = ? WHERE id = ? AND user_id = ?',
            [rating, review, id, CURRENT_USER_ID]
        );
        res.json({ message: "Update successful" });
    } catch (err) {
        res.status(500).json({ error: "Update failed" });
    }
});

// DELETE: Remove a movie
app.delete('/api/movies/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM watchlist WHERE id = ? AND user_id = ?', [id, CURRENT_USER_ID]);
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Delete failed" });
    }
});

// ANALYTICS: Aggregated Data (The "Heavy" Requirement)
app.get('/api/analytics', async (req, res) => {
    try {
        const [[total]] = await pool.query('SELECT COUNT(*) as count FROM watchlist WHERE user_id = ?', [CURRENT_USER_ID]);
        const [[avg]] = await pool.query('SELECT AVG(rating) as avg FROM watchlist WHERE user_id = ?', [CURRENT_USER_ID]);
        const [[genre]] = await pool.query(
            'SELECT genre FROM watchlist WHERE user_id = ? GROUP BY genre ORDER BY COUNT(*) DESC LIMIT 1', 
            [CURRENT_USER_ID]
        );
        
        res.json({
            totalMovies: total.count || 0,
            averageRating: avg.avg ? parseFloat(avg.avg).toFixed(1) : "0.0",
            favoriteGenre: genre ? genre.genre : "N/A"
        });
    } catch (err) {
        res.status(500).json({ error: "Analytics calculation failed" });
    }
});

// 5. Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 CineMetrics Backend is Running!`);
    console.log(`🔗 Local Dashboard: http://localhost:${PORT}`);
});