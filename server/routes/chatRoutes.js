const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    const chat = new Chat({
      userId: req.user.userId,
      name: req.body.name,
      messages: req.body.messages
    });
    await chat.save();
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user.userId });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const chat = await Chat.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { $set: req.body },
      { new: true }
    );
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Chat.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });
    res.json({ message: 'Chat deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 