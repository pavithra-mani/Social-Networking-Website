import express from "express"
import { toggleFollow } from "../controllers/followController.js"
import { followUser } from "../controllers/followController.js"


const router = express.Router()

router.post("/", toggleFollow)
router.post("/", followUser)

export default router