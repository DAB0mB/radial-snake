Game.Entities.Snake = class Snake {
  // Represents a snake data-structure which will eventually appear on screen.
  // All the properties provided to the constructor are the initial values of
  // the snake
  constructor(x, y, r, rad, v, color, keyStates, options) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.rad = rad;
    this.v = v;
    this.color = color;
    this.keyStates = keyStates;
    // A snake is made out of many geometry shapes
    this.shapes = [];
    // A snake starts with a line
    this.currShape = new Engine.Geometry.Line(x, y, x, y);
    this.shapes.push(this.currShape);
    // A score can be provided in case we want to reserve previous scores from
    // recent matches
    this.score = options.score || 0;

    // Custom keys can be specified
    if (options.keys && options.keys) {
      this.leftKey = options.keys.left;
      this.rightKey = options.keys.right;
    }
    // Left and right arrow keys will be used by default
    else {
      this.leftKey = 37; // Left arrow
      this.rightKey = 39; // Right arrow
    }
  }

  draw(context) {
    // Draw all shapes in the shapes array
    this.shapes.forEach(shape => {
      context.save();
      context.strokeStyle = this.color;
      context.lineWidth = 3;
      context.beginPath();

      // Use a different drawing method for line and circle
      if (shape instanceof Engine.Geometry.Line) {
        context.moveTo(shape.x1, shape.y1);
        context.lineTo(shape.x2, shape.y2);
      }
      else {
        context.arc(shape.x, shape.y, shape.r, shape.rad1, shape.rad2);
      }

      context.stroke();
      context.restore();
    });
  }

  update(span, width, height) {
    // Progress made based on elapsed time and velocity
    let step = (this.v * span) / 1000;

    this.updateShapes(step, width, height);
    this.cycleThrough(step, width, height);
  }

  // Updates shapes array based on progress made
  updateShapes(step, width, height, options = {}) {
    // Line update logic
    if (this.currShape instanceof Engine.Geometry.Line) {
      let lastX = options.lastX || this.x;
      let lastY = options.lastY || this.y;
      this.x = options.x || this.currShape.x2;
      this.y = options.y || this.currShape.y2;
      this.lastBit = new Engine.Geometry.Line(lastX, lastY, this.x, this.y);
    }
    // Circle update logic
    else {
      let lastX = options.lastX || this.currShape.x;
      let lastY = options.lastY || this.currShape.y;
      let lastR = options.lastR || this.currShape.r;

      // Update logic for left rotation
      if (this.direction == "left") {
        let lastRad = this.rad + (0.5 * Math.PI);
        let currShapePoint = this.currShape.getPoint(this.currShape.rad1);
        this.x = options.x || currShapePoint.x;
        this.y = options.y || currShapePoint.y;
        this.rad = this.currShape.rad1 - (0.5 * Math.PI);
        this.lastBit = new Engine.Geometry.Circle(lastX, lastY, lastR, this.currShape.rad1, lastRad);
      }
      // Update logic for right rotation
      else {
        let lastRad = this.rad - (0.5 * Math.PI);
        let currShapePoint = this.currShape.getPoint(this.currShape.rad2);
        this.x = options.x || currShapePoint.x;
        this.y = options.y || currShapePoint.y;
        this.rad = this.currShape.rad2 + (0.5 * Math.PI);
        this.lastBit = new Engine.Geometry.Circle(lastX, lastY, lastR, lastRad, this.currShape.rad2);
      }
    }

    // Update the direction based on pressed key
    if (this.keyStates.get(this.leftKey))
      var direction = "left";
    else if (this.keyStates.get(this.rightKey))
      var direction = "right";

    // If there is no change direction, abort, unless we force it
    if (direction != this.direction || options.force) {
      this.direction = direction;

      // This will push a new shape with new properties, based on the direction
      switch (direction) {
        case "left":
          var angle = this.rad - (0.5 * Math.PI);
          var rad = this.rad + (0.5 * Math.PI);
          var x = this.x + (this.r * Math.cos(angle));
          var y = this.y + (this.r * Math.sin(angle));
          this.currShape = new Engine.Geometry.Circle(x, y, this.r, rad, rad);
          break;
        case "right":
          angle = this.rad + (0.5 * Math.PI);
          rad = this.rad - (0.5 * Math.PI);
          x = this.x + (this.r * Math.cos(angle));
          y = this.y + (this.r * Math.sin(angle));
          this.currShape = new Engine.Geometry.Circle(x, y, this.r, rad, rad);
          break;
        default:
          this.currShape = new Engine.Geometry.Line(this.x, this.y, this.x, this.y);
      }

      this.shapes.push(this.currShape);
    }

    // Extend the recent shape based on progress made
    switch (direction) {
      case "left":
        this.currShape.rad1 -= step / this.r;
        break;
      case "right":
        this.currShape.rad2 += step / this.r;
        break;
      default:
        this.currShape.x2 += step * Math.cos(this.rad);
        this.currShape.y2 += step * Math.sin(this.rad);
    }
  }

  // Handles case where snake is out limits and we need to render it from
  // the other side of the canvas
  cycleThrough(step, width, height) {
    let intersectionPoint = this.getCanvasIntersection(width, height);

    if (!intersectionPoint) return;

    intersectionPoint = intersectionPoint[0];

    // Re-calculate position based on canvas bounds
    if (intersectionPoint.x % width == 0)
      this.x = (this.x - width).mod(width);
    if (intersectionPoint.y % height == 0)
      this.y = (this.y - height).mod(height);

    // Update shapes again based on custom properties
    this.updateShapes(step, width, height, {
      force: true,
      lastX: this.x,
      lastY: this.y,
      x: this.x,
      y: this.y
    });
  }

  // Gets intersection points between last bit and own shapes
  getSelfIntersection() {
    if (this.currShape instanceof Engine.Geometry.Circle &&
       Math.abs(this.currShape.rad1 - this.currShape.rad2) >= 2 * Math.PI) {
      if (this.direction == "left")
        var rad = this.currShape.rad1;
      else
        var rad = this.currShape.rad2;

      return this.currShape.getPoint(rad);
    }

    let result;

    this.shapes.slice(0, -2).some(shape =>
      result = this.lastBit.getIntersection(shape)
    );

    return result;
  }

  // Returns intersection points between snakes
  getSnakeIntersection(snake) {
    let result;

    snake.shapes.some(shape =>
      // Only last bit is relevant, if we reached this point it means that
      // previous intersection will definitely fail
      result = this.lastBit.getIntersection(shape)
    );

    return result;
  }

  // Returns intersection points between snake and canvas
  getCanvasIntersection(width, height) {
    // Canvas polygon
    let canvasPolygon = new Engine.Geometry.Polygon(
      [0, 0, width, 0],
      [width, 0, width, height],
      [width, height, 0, height],
      [0, height, 0, 0]
    );

    return canvasPolygon.getIntersection(this.lastBit);
  }
};