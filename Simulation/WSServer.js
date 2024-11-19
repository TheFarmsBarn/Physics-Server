const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');  // For unique player IDs

class WSServer {
    constructor(Rapier) {
        this.Rapier = Rapier;
        const wss = new WebSocket.Server({ port: 8080 });

        // Initialize physics world
        let gravity = new this.Rapier.Vector3(0, -9.81, 0);
        this.world = new this.Rapier.World(gravity);

        this.players = {};  // Store players' data (id, kart body, position, etc.)
        this.inputs = {};   // Store player inputs (throttle, steer) for each player

        // Create the ground (static)
        const groundCollider = this.Rapier.ColliderDesc.cuboid(50, 0.1, 50);  // Large flat ground collider
        const groundBodyDesc = this.Rapier.RigidBodyDesc.fixed();  // Static ground (fixed body)
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

            // Create a kart for the player
            const kartBodyDesc = this.Rapier.RigidBodyDesc.dynamic().setTranslation(0, 1, 0);  // Position kart above the ground
            const kartCollider = this.Rapier.ColliderDesc.cuboid(0.5, 0.2, 1.0);  // Kart's collider
            const kartBody = this.world.createRigidBody(kartBodyDesc);
            this.world.createCollider(kartCollider, kartBody);

            this.players[playerId] = { id: playerId, body: kartBody, ws: ws };

            // Send the initial kart state to the new player
            ws.send(JSON.stringify({
                type: 'JOIN',
                playerId: playerId,
                initialPosition: kartBody.translation()
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
            const gameState = Object.values(this.players).map(player => ({
                playerId: player.id,
                position: player.body.translation(),
                rotation: player.body.rotation()
            }));

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
            const kart = this.players[playerId].body;

            // Apply throttle (forward/backward force)
            if (input.throttle) {
                kart.addForce(new this.Rapier.Vector3(0, 0, input.throttle * 10));  // Apply forward force
            }

            // Apply steering (turning torque)
            if (input.steer) {
                kart.addTorque(new this.Rapier.Vector3(0, input.steer * 2, 0));  // Apply turning torque
            }

            // Apply damping (linear)
            this.applyDamping(kart);

            // Apply max speed limit
            this.limitMaxSpeed(kart);
        });

        // Perform the physics update
        this.world.step();
    }

    // Apply linear damping (opposite of the velocity to slow down the kart)
    applyDamping(kart) {
        const dampingFactor = 0.99;  // Damping factor (0.99 will slowly reduce speed over time)
        const velocity = kart.linvel();  // Get the current linear velocity
        const dampingForce = scale(this.Rapier, velocity, dampingFactor * -1);
        kart.addForce(dampingForce);  // Apply damping force to the kart
    }

    // Limit the maximum speed of the kart
    limitMaxSpeed(kart) {
        const maxSpeed = 10;  // Maximum speed (adjust as necessary)
        const velocity = kart.linvel();  // Get the current velocity
        const speed = magnitude(this.Rapier, velocity);  // Calculate the speed (magnitude of velocity)

        if (speed > maxSpeed) {
            const speedFactor = maxSpeed / speed;  // Calculate the scaling factor to reduce speed
            const limitedVelocity = scale(this.Rapier, velocity, speedFactor);

            kart.setLinvel(limitedVelocity);  // Set the velocity to the limited value
        }
    }
}



function magnitude(Rapier, vector) {
    return Math.sqrt(vector.x*vector.x + vector.y * vector.y + vector.z * vector.z)
}
function scale(Rapier, vector, scaler) {
    return new Rapier.Vector3(vector.x * scaler, vector.y * scaler, vector.z * scaler);
}
module.exports = WSServer;
