const express = require("express");
const { toggleFollow, checkFollowStatus, getFollowerCounts } = require("../controllers/followController");

const router = express.Router();

// Check follow status
router.get("/status/:followerUid/:followingUid", checkFollowStatus);

// Get follower counts
router.get("/counts/:userId", getFollowerCounts);

// Single endpoint to handle follow / unfollow behaviour.
// The controller inspects the existing relationship and either
// creates or deletes it accordingly.
router.post("/", toggleFollow);

module.exports = router;