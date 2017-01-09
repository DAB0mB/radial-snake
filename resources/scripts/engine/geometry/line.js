Engine.Geometry.Line = class Line {
  // x1 - The first point's x value
  // y1 - The first point's y value
  // x1 - The second point's x value
  // y2 - The second point's y value
  constructor(x1, y1, x2, y2) {
    this.x1 = x1.trim(9);
    this.y1 = y1.trim(9);
    this.x2 = x2.trim(9);
    this.y2 = y2.trim(9);
  }

  // Gets the matching x value for a given y value
  getX(y) {
    let x = ((((y - this.y1) * (this.x2 - this.x1)) / (this.y2 - this.y1)) + this.x1).trim(9);
    if (isNaN(x) || x.isBetween(this.x1, this.x2)) return x;
  }

  // Gets the matching y value for a given x value
  getY(x) {
    let y = ((((x - this.x1) * (this.y2 - this.y1)) / (this.x2 - this.x1)) + this.y1).trim(9);
    if (isNaN(y) || y.isBetween(this.y1, this.y2)) return y;
  }

  // Returns if line has given point
  hasPoint(x, y) {
    if (!this.boundsHavePoint(x, y)) return false;
    let m = ((this.y2 - this.y1) / (this.x2 - this.x1)).trim(9);
    return (y - this.y1) / (x - this.x1) == m;
  }

  // Returns if given point is contained by the bounds aka cage of line
  boundsHavePoint(x, y) {
    return x.isBetween(this.x1, this.x2) &&
    y.isBetween(this.y1, this.y2);
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
    if (!(((this.x1 - this.x2) * (line.y1 - line.y2)) - ((this.y1 - this.y2) * (line.x1 - line.x2)))) return;

    let x = (((((this.x1 * this.y2) - (this.y1 * this.x2)) * (line.x1 - line.x2)) - ((this.x1 - this.x2) * ((line.x1 * line.y2) - (line.y1 * line.x2)))) /
        (((this.x1 - this.x2) * (line.y1 - line.y2)) - ((this.y1 - this.y2) * (line.x1 - line.x2)))).trim(9);
    let y = (((((this.x1 * this.y2) - (this.y1 * this.x2)) * (line.y1 - line.y2)) - ((this.y1 - this.y2) * ((line.x1 * line.y2) - (line.y1 * line.x2)))) /
        (((this.x1 - this.x2) * (line.y1 - line.y2)) - ((this.y1 - this.y2) * (line.x1 - line.x2)))).trim(9);

    if (x.isBetween(this.x1, this.x2) && x.isBetween(line.x1, line.x2) &&
       y.isBetween(this.y1, this.y2) && y.isBetween(line.y1, line.y2)) {
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