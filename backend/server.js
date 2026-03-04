import express from "express"
import cors from "cors"
import dotenv from "dotenv"

import followRoutes from "./routes/followRoutes.js"
import postRoutes from "./routes/postRoutes.js"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/follow", followRoutes)
app.use("/api/posts", postRoutes)

app.get("/", (req, res) => {
  res.send("Iris backend running")
})

const PORT = 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})