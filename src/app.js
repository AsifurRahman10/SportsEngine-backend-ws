import express from 'express'
import http from 'http'
import { matchRoutes } from './modules/match/match.js'
import { attachWebSocketServer } from './server.js'
import { commentaryRouter } from './modules/commentary/commentary.js'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const PORT = Number(process.env.PORT || 5000)
const HOST = process.env.HOST || '0.0.0.0'

const app = express()
const server = http.createServer(app)

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true
  })
)

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Welcome to the SportEngine WebSocket Server!')
})

app.use('/match', matchRoutes)
app.use('/match/:id/commentary', commentaryRouter)
const { broadcastMatchCreated, broadcastCommentary } =
  attachWebSocketServer(server)
app.locals.broadcastMatchCreated = broadcastMatchCreated
app.locals.broadcastCommentary = broadcastCommentary

server.listen(PORT, HOST, () => {
  const baseUrl =
    HOST === '0.0.0.0' ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`

  console.log(`Server is running on ${baseUrl}`)
  console.log(
    `WebSocket Server is running on ${baseUrl.replace('http', 'ws')}/ws`
  )
})
