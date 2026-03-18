const express = require("express");
const { toggleFollow } = require("../controllers/followController");

const router = express.Router();

// Single endpoint to handle follow / unfollow behaviour.
// The controller inspects the existing relationship and either
// creates or deletes it accordingly.
router.post("/", toggleFollow);

module.exports = router;