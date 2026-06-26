// Direct port of Python Delivery class
class Delivery {
  constructor(deliveryId, x, y, weight, deadline) {
    this.id = deliveryId;
    this.x = x;
    this.y = y;
    this.weight = weight;
    this.deadline = deadline;
    this.assigned = false;
  }
}

module.exports = Delivery;
