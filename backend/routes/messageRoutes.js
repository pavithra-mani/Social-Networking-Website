const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");

router.get("/test", (req, res) => {
  res.send("Message routes working");
});

router.post("/send", messageController.sendMessage);
router.get("/chat/:friendId", messageController.getChat);

module.exports = router;