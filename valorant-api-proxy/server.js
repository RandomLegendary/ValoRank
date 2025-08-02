const express = require('express');
const cors = require('cors');
const axios = require('axios');

require('dotenv').config()

const app = express();
const PORT = 3000;

app.use(cors());

const API_KEY = process.env.API_KEY;

// Proxy endpoint Account
app.get('/valorant/account/:username/:tag', async (req, res) => {
  const urlAccount = `https://api.henrikdev.xyz/valorant/v2/account/${req.params.username}/${req.params.tag}`;
  const response = await axios.get(urlAccount, {
    headers: { "Authorization": API_KEY }
  });
  res.json(response.data);
});

// Proxy endpoint Matchlist
app.get('/valorant/matchlist/:region/:username/:tag', async (req, res) => {
  const urlMatchlist = `https://api.henrikdev.xyz/valorant/v3/matches/${req.params.region}/${req.params.username}/${req.params.tag}`;
  const response = await axios.get(urlMatchlist, {
    headers: { "Authorization": API_KEY }
  });
  res.json(response.data);
});

// Proxy endpoint MMR
app.get('/valorant/mmr/:region/:platform/:username/:tag', async (req, res) => {
  const urlMMR = `https://api.henrikdev.xyz/valorant/v3/mmr/${req.params.region}/${req.params.platform}/${req.params.username}/${req.params.tag}`;
  const response = await axios.get(urlMMR, {
    headers: { "Authorization": API_KEY }
  });
  res.json(response.data);
});



app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});



