import express from 'express'
import http from 'http'
import { matchRoutes } from './modules/match/match.js'
import { attachWebSocketServer } from './server.js'
import { commentaryRouter } from './modules/commentary/commentary.js'

const PORT = Number(process.env.PORT || 5000)
const HOST = process.env.HOST || '0.0.0.0'

const app = express()
const server = http.createServer(app)

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
