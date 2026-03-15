import express from "express"
import cors from "cors"
import dotenv from "dotenv"

import postRoutes from "./routes/postRoutes.js"
import followRoutes from "./routes/followRoutes.js"
import feedRoutes from "./routes/feedRoutes.js"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/posts", postRoutes)
app.use("/api/follow", followRoutes)
app.use("/api/feed", feedRoutes)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})