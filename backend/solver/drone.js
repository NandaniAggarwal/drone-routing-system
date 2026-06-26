const { MAX_BATTERY } = require('./utils');

// Direct port of Python DroneState class
class DroneState {
  constructor(droneId, maxPayload, wx, wy) {
    this.id = droneId;
    this.maxPayload = maxPayload;
    this.x = wx;
    this.y = wy;
    this.t = 0.0;
    this.battery = MAX_BATTERY;
  }
}

module.exports = DroneState;
