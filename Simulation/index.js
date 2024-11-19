const Rapier = require("@dimforge/rapier3d-compat");
const WSServer = require("./WSServer.js");

// once init has completed Rapier should function the same as in the browser
Rapier.init()
	.then(() => {
    let wsServer = new WSServer(Rapier);
  });