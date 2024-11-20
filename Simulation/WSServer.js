const Rapier = require("@dimforge/rapier3d-compat");
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');  // For unique player IDs

const Helper = require('./Helper.js');
const Kart = require('./Kart');

class WSServer {
    constructor() {
        const wss = new WebSocket.Server({ port: 8080 });

        // Initialize physics world
        let gravity = new Rapier.Vector3(0, -9.81, 0);
        this.world = new Rapier.World(gravity);

        this.players = {};  // Store players' data (id, kart body, position, etc.)
        this.inputs = {};   // Store player inputs (throttle, steer) for each player

        // Create the ground (static)
        const groundCollider = Rapier.ColliderDesc.cuboid(50, 0.1, 50);  // Large flat ground collider
        const groundBodyDesc = Rapier.RigidBodyDesc.fixed();  // Static ground (fixed body)
        const groundBody = this.world.createRigidBody(groundBodyDesc);
        this.world.createCollider(groundCollider, groundBody);

        // Start the physics loop (60 FPS)
        setInterval(() => {
            this.updatePhysics();  // Perform physics update every tick
            this.broadcastState();  // Broadcast state to all players
        }, 1000 / 60);  // 60 times per second (60 FPS)

        // WebSocket connection handler
        wss.on('connection', (ws) => {
            const playerId = uuidv4();  // Unique ID for each player
            console.log(`Player ${playerId} connected`);

            let kart = new Kart(this.world);

            this.players[playerId] = { id: playerId, kart: kart, ws: ws };

            // Send the initial kart state to the new player
            ws.send(JSON.stringify({
                type: 'JOIN',
                playerId: playerId,
                geometry: kart.getGeometry()
            }));

            // Send ground creation event to all players
            this.sendGroundToPlayer(ws);

            // Broadcast all players' states to the new player
            this.broadcastState(ws);

            // Handle incoming messages (player input)
            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message);

                    if (data.type === 'MOVE') {
                        const playerInput = data.input;
                        // Store the player's input for this tick
                        this.inputs[playerId] = playerInput;
                    }
                } catch (err) {
                    console.error('Error handling message:', err);
                }
            });

            // Handle player disconnect
            ws.on('close', () => {
                delete this.players[playerId];  // Remove player data
                console.log(`Player ${playerId} disconnected`);
                this.broadcastState();
            });
        });

        // Helper function to broadcast the game state to all players
        this.broadcastState = (senderWs = null) => {
            const gameState = Object.values(this.players).map(player => {
                // Get the full geometry (position, rotation, chassis, and wheels) from the kart
                const geometry = player.kart.getGeometry();

                return {
                    playerId: player.id,
                    geometry: geometry  // Send full geometry including position, rotation, chassis, and wheels
                };
            });

            // Send the game state to all clients except the sender
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN && client !== senderWs) {
                    client.send(JSON.stringify({
                        type: 'STATE_UPDATE',
                        players: gameState
                    }));
                }
            });
        };

        // Send the ground to a new player
        this.sendGroundToPlayer = (ws) => {
            ws.send(JSON.stringify({
                type: 'CREATE_GROUND'
            }));
        };

        console.log('WebSocket server running on ws://localhost:8080');
    }

    // Perform the physics update on each tick
    updatePhysics() {
        // Apply the stored inputs to each player's kart
        Object.entries(this.inputs).forEach(([playerId, input]) => {
            const kart = this.players[playerId].kart;
            
            kart.moveForward(input.throttle);
            kart.steer(input.steer);

        });

        // Perform the physics update
        this.world.step();
    }
}

module.exports = WSServer;
