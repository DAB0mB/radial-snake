Engine.Geometry.Circle = class Circle {
  // x - The x value of the circle's center
  // y - The y value of the circle's center
  // r - The radius of the center
  // rad1 - The first radian of the circle, not necessarily its beginning
  // rad2 - The second radian of the circle, not necessarily its beginning
  constructor(x, y, r, rad1, rad2) {
    this.x = Utils.trim(x, 9);
    this.y = Utils.trim(y, 9);
    this.r = Utils.trim(r, 9);

    // Trimming mode is done based on which radian represents the ending and which radian
    // represents the ending
    if (rad1 > rad2) {
      this.rad1 = Utils.trim(rad1, 9, "floor");
      this.rad2 = Utils.trim(rad2, 9, "ceil");
    }
    else {
      this.rad1 = Utils.trim(rad1, 9, "ceil");
      this.rad2 = Utils.trim(rad2, 9, "floor");
    }
  }

  // Draws the circle on the given context
  draw(context) {
    context.arc(this.x, this.y, this.r, this.rad1, this.rad2);
  }

  // Gets the matching x value for the given radian
  getX(rad) {
    if (!Utils(rad).trim(9).isBetween(this.rad1, this.rad2).value()) return;
    return Utils.trim((this.r * Math.cos(rad)) + this.x, 9);
  }

  // Gets the matching y value for the given radian
  getY(rad) {
    if (!Utils(rad).trim(9).isBetween(this.rad1, this.rad2).value()) return;
    return Utils.trim((this.r * Math.sin(rad)) + this.y, 9);
  }

  // Gets the matching point for the given radian
  getPoint(rad) {
    if (!Utils.isBetween(rad, this.rad1, this.rad2)) return;

    return {
      x: Utils.trim((this.r * Math.cos(rad)) + this.x, 9),
      y: Utils.trim((this.r * Math.sin(rad)) + this.y, 9)
    };
  }

  // Gets the matching radian for the given point
  getRad(x, y) {
    let rad = Math.atan2(y - this.y, x - this.x);

    // If calculated radian is in circle's radian range, return it
    if (rad != null && Utils.isBetween(rad, this.rad1, this.rad2)) {
      return rad;
    }

    // The calculated radian can still be in the circle's radian range in case one
    // of the radians is greater than 2 PIEs
    if (Math.abs(this.rad1) > Math.abs(this.rad2)) {
      var greatestRad = this.rad1;
    }
    else {
      var greatestRad = this.rad2;
    }

    // Check if the absolute radian is in the circle's radian range
    if (Utils(rad + (2 * Math.PI * Math.floor(greatestRad / (2 * Math.PI)))).trim(9).isBetween(this.rad1, this.rad2).value() ||
        Utils(rad + (2 * Math.PI * Math.ceil(greatestRad / (2 * Math.PI)))).trim(9).isBetween(this.rad1, this.rad2).value()) {
      return rad;
    }
  }

  // Returns if circle has given points
  hasPoint(x, y) {
    return this.getRad(x, y) != null;
  }

  getIntersection(shape) {
    if (shape instanceof Engine.Geometry.Line)
      return this.getLineIntersection(shape);
    if (shape instanceof Engine.Geometry.Circle)
      return this.getCircleIntersection(shape);
    if (shape instanceof Engine.Geometry.Polygon)
      return this.getPolygonIntersection(shape);
  }

  // circle - circle intersection method
  getCircleIntersection(circle) {
    let dx = circle.x - this.x;
    let dy = circle.y - this.y;
    let d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

    if (d > this.r + circle.r ||
       d < Math.abs(this.r - circle.r)) {
      return;
    }

    let a = ((Math.pow(this.r, 2) - Math.pow(circle.r, 2)) + Math.pow(d, 2)) / (2 * d);
    let x = this.x + ((dx * a) / d);
    let y = this.y + ((dy * a) / d);
    let h = Math.sqrt(Math.pow(this.r, 2) - Math.pow(a, 2));
    let rx = (- dy * h) / d;
    let ry = (dx * h) / d;

    let interPoints = [
      {
        x: x + rx,
        y: y + ry
      },
      {
        x: x - rx,
        y: y - ry
      }
    ]
    .map(point => ({
        x: Utils.trim(point.x, 9),
        y: Utils.trim(point.y, 9)
     }));

    interPoints = _.uniq(interPoints, point => `(${point.x}, ${point.y})`);

    [this, circle].forEach(function(circle) {
      interPoints = interPoints.filter(point => circle.hasPoint(point.x, point.y));
    });

    if (interPoints.length > 0) return interPoints;
  }

  // circle - line intersection method
  getLineIntersection(line) {
    let x1 = line.x1 - this.x;
    let x2 = line.x2 - this.x;
    let y1 = line.y1 - this.y;
    let y2 = line.y2 - this.y;
    let dx = x2 - x1;
    let dy = y2 - y1;
    let d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    let h = (x1 * y2) - (x2 * y1);
    let delta = (Math.pow(this.r, 2) * Math.pow(d, 2)) - Math.pow(h, 2);

    if (delta < 0) return;

    let interPoints = [
      {
        x: (((h * dy) + (((dy / Math.abs(dy)) || 1) * dx * Math.sqrt(delta))) / Math.pow(d, 2)) + this.x,
        y: (((-h * dx) + (Math.abs(dy) * Math.sqrt(delta))) / Math.pow(d, 2)) + this.y
      },
      {
        x: (((h * dy) - (((dy / Math.abs(dy)) || 1) * dx * Math.sqrt(delta))) / Math.pow(d, 2)) + this.x,
        y: (((-h * dx) - (Math.abs(dy) * Math.sqrt(delta))) / Math.pow(d, 2)) + this.y
      }
    ]
    .map(point => ({
        x: Utils.trim(point.x, 9),
        y: Utils.trim(point.y, 9)
    }))
    .filter(point => {
      return this.hasPoint(point.x, point.y) &&
        line.boundsHavePoint(point.x, point.y);
    });

    interPoints = _.uniq(interPoints, point => `(${point.x}, ${point.y})`);

    if (interPoints.length > 0) return interPoints;
  }

  // circle - polygon intersection method
  getPolygonIntersection(polygon) {
    return polygon.getCircleIntersection(this);
  }
};