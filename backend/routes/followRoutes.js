import express from "express"
import { toggleFollow } from "../controllers/followController.js"

const router = express.Router()

router.post("/", toggleFollow)

export default router