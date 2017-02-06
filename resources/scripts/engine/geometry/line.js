Engine.Geometry.Line = class Line extends Utils.proxy(CPP.Geometry.Line) {
  // Draws the line on the given context
  draw(context) {
    context.moveTo(this.x1, this.y1);
    context.lineTo(this.x2, this.y2);
  }

  getIntersection(shape) {
    if (shape instanceof Engine.Geometry.Line)
      return this.getLineIntersection(shape);
    if (shape instanceof Engine.Geometry.Circle)
      return this.getCircleIntersection(shape);
    if (shape instanceof Engine.Geometry.Polygon)
      return this.getPolygonIntersection(shape);
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