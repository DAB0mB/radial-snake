Engine.Geometry.Circle = class Circle extends Utils.proxy(CPP.Geometry.Circle) {
  // Draws the circle on the given context
  draw(context) {
    context.arc(this.x, this.y, this.r, this.rad1, this.rad2);
  }

  getIntersection(shape) {
    if (shape instanceof Engine.Geometry.Line)
      return this.getLineIntersection(shape);
    if (shape instanceof Engine.Geometry.Circle)
      return this.getCircleIntersection(shape);
    if (shape instanceof Engine.Geometry.Polygon)
      return this.getPolygonIntersection(shape);
  }

  // circle - polygon intersection method
  getPolygonIntersection(polygon) {
    return polygon.getCircleIntersection(this);
  }
};