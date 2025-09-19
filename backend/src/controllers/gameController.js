const Game = require('../models/Game');

exports.getGames = async (req, res) => {
  try {
    const games = await Game.find();
    res.json(games);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createGame = async (req, res) => {
  try {
    const game = await Game.create(req.body);
    res.json(game);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
