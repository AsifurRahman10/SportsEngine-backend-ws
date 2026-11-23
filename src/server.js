import { WebSocketServer } from 'ws'

export function attachWebSocketServer(server) {
  const ws = new WebSocketServer({
    noServer: true,
    path: '/ws',
    maxPayload: 1024 * 1024
  })

  server.on('upgrade', async (req, socket, head) => {
    const { pathname } = new URL(req.url, `http://${req.headers.host}`)
  })
}
