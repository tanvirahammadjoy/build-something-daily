const WebSocket = require('ws')
const http = require('http')

// Create HTTP server
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('WebSocket Chat Server Running\n')
})

// Create WebSocket server
const wss = new WebSocket.Server({ server })

// Store connected clients with their usernames
const clients = new Map()

// Broadcast message to all clients
function broadcast(message, sender) {
    const payload = JSON.stringify({
        type: 'message',
        ...message,
        timestamp: new Date().toISOString(),
    })

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && client !== sender) {
            client.send(payload)
        }
    })
}

// Handle new connections
wss.on('connection', (ws) => {
    console.log('New client connected')

    // Assign a default username
    let username = `User${Math.floor(Math.random() * 1000)}`
    clients.set(ws, { username })

    // Send welcome message
    ws.send(
        JSON.stringify({
            type: 'system',
            content: `Welcome to the chat, ${username}!`,
            timestamp: new Date().toISOString(),
        }),
    )

    // Handle incoming messages
    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data)

            if (message.type === 'setUsername') {
                const oldUsername = username
                username = message.username || username
                clients.set(ws, { username })

                ws.send(
                    JSON.stringify({
                        type: 'system',
                        content: `Username changed to ${username}`,
                        timestamp: new Date().toISOString(),
                    }),
                )

                // Broadcast user joined
                broadcast(
                    {
                        type: 'system',
                        content: `${oldUsername} is now known as ${username}`,
                    },
                    ws,
                )
                return
            }

            // Regular chat message
            if (message.type === 'chat') {
                const chatMessage = {
                    username: username,
                    content: message.content,
                    room: message.room || 'general',
                }

                console.log(
                    `[${chatMessage.room}] ${username}: ${message.content}`,
                )

                // Echo back to sender
                ws.send(
                    JSON.stringify({
                        type: 'message',
                        ...chatMessage,
                        timestamp: new Date().toISOString(),
                        isOwn: true,
                    }),
                )

                // Broadcast to others
                broadcast(chatMessage, ws)
            }
        } catch (e) {
            console.error('Invalid message format', e)
        }
    })

    // Handle disconnection
    ws.on('close', () => {
        console.log('Client disconnected')
        const user = clients.get(ws)
        if (user) {
            broadcast(
                {
                    type: 'system',
                    content: `${user.username} has left the chat`,
                },
                ws,
            )
            clients.delete(ws)
        }
    })

    // Handle errors
    ws.on('error', (err) => {
        console.error('WebSocket error:', err)
    })
})

const PORT = process.env.PORT || 8080
server.listen(PORT, () => {
    console.log(`🚀 WebSocket server running on ws://localhost:${PORT}`)
    console.log(`HTTP server running on http://localhost:${PORT}`)
})
