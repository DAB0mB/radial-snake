Engine.Geometry.Line = class Line {
  // x1 - The first point's x value
  // y1 - The first point's y value
  // x1 - The second point's x value
  // y2 - The second point's y value
  constructor(x1, y1, x2, y2) {
    this.x1 = Utils.trim(x1, 9);
    this.y1 = Utils.trim(y1, 9);
    this.x2 = Utils.trim(x2, 9);
    this.y2 = Utils.trim(y2, 9);
  }

  // Draws the line on the given context
  draw(context) {
    context.moveTo(this.x1, this.y1);
    context.lineTo(this.x2, this.y2);
  }

  // Gets the matching x value for a given y value
  getX(y) {
    let x = Utils.trim((((y - this.y1) * (this.x2 - this.x1)) / (this.y2 - this.y1)) + this.x1, 9);
    if (isNaN(x) || Utils.isBetween(x, this.x1, this.x2)) return x;
  }

  // Gets the matching y value for a given x value
  getY(x) {
    let y = Utils.trim((((x - this.x1) * (this.y2 - this.y1)) / (this.x2 - this.x1)) + this.y1, 9);
    if (isNaN(y) || Utils.isBetween(y, this.y1, this.y2)) return y;
  }

  // Returns if line has given point
  hasPoint(x, y) {
    if (!this.boundsHavePoint(x, y)) return false;
    let m = Utils.trim((this.y2 - this.y1) / (this.x2 - this.x1), 9);
    return (y - this.y1) / (x - this.x1) == m;
  }

  // Returns if given point is contained by the bounds aka cage of line
  boundsHavePoint(x, y) {
    return Utils.isBetween(x, this.x1, this.x2) &&
           Utils.isBetween(y, this.y1, this.y2);
  }

  getIntersection(shape) {
    if (shape instanceof Engine.Geometry.Line)
      return this.getLineIntersection(shape);
    if (shape instanceof Engine.Geometry.Circle)
      return this.getCircleIntersection(shape);
    if (shape instanceof Engine.Geometry.Polygon)
      return this.getPolygonIntersection(shape);
  }

  // line - line intersection method
  getLineIntersection(line) {
    // Escape if lines are parallel
    if (!(((this.x1 - this.x2) * (line.y1 - line.y2)) - ((this.y1 - this.y2) * (line.x1 - line.x2)))) return;

    // Intersection point formula
    let x = Utils.trim(((((this.x1 * this.y2) - (this.y1 * this.x2)) * (line.x1 - line.x2)) - ((this.x1 - this.x2) * ((line.x1 * line.y2) - (line.y1 * line.x2)))) /
        (((this.x1 - this.x2) * (line.y1 - line.y2)) - ((this.y1 - this.y2) * (line.x1 - line.x2))), 9);
    let y = Utils.trim(((((this.x1 * this.y2) - (this.y1 * this.x2)) * (line.y1 - line.y2)) - ((this.y1 - this.y2) * ((line.x1 * line.y2) - (line.y1 * line.x2)))) /
        (((this.x1 - this.x2) * (line.y1 - line.y2)) - ((this.y1 - this.y2) * (line.x1 - line.x2))), 9);

    if (Utils.isBetween(x, this.x1, this.x2) && Utils.isBetween(x, line.x1, line.x2) &&
        Utils.isBetween(y, this.y1, this.y2) && Utils.isBetween(y, line.y1, line.y2)) {
      return { x, y };
    }
  }

  // line - circle intersection method
  getCircleIntersection(circle) {
    return circle.getLineIntersection(this);
  }

  // line - polygon intersection method
  getPolygonIntersection(polygon) {
    return polygon.getLineIntersection(this);
  }
};