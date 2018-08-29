Engine.Geometry.Polygon = class Polygon {
  // bounds - an array of arrays. Each sub-array represents the arguments vector which
  //   will be invoked by the line's construction method
  constructor(...bounds) {
    this.bounds = bounds.map(coords => new Engine.Geometry.Line(...coords));
  }

  // Returns if polygon has given point
  hasPoint(x, y) {
    // Run check for each bound
    return this.bounds.some(bound => bound.hasPoint(x, y));
  }

  getIntersection(shape) {
    if (shape instanceof Engine.Geometry.Line)
      return this.getLineIntersection(shape);
    if (shape instanceof Engine.Geometry.Circle)
      return this.getCircleIntersection(shape);
    if (shape instanceof Engine.Geometry.Polygon)
      return this.getPolygonIntersection(shape);
  }

  // polygon - line intersection method
  getLineIntersection(line) {
    // line - line intersection for each bound
    let result = this.bounds.reduce((result, bound) => {
      let intersection = line.getLineIntersection(bound);
      if (intersection) result = result.concat(intersection);
      return result;
    }, []);

    if (result.length) return result;
  }

  // polygon - circle intersection method
  getCircleIntersection(circle) {
    // line - circle intersection for each bound
    let result = this.bounds.reduce((result, bound) => {
      let intersection = circle.getLineIntersection(bound);
      if (intersection) result = result.concat(intersection);
      return result;
    }, []);

    if (result.length) return result;
  }

  // polygon - polygon intersection method
  getPolygonIntersection(polygon) {
    // line - polygon intersection for each bound
    let result = this.bounds.reduce((result, bound) => {
      let intersection = polygon.getLineIntersection(bound);
      if (intersection) result = result.concat(intersection);
      return result;
    }, []);

    if (result.length) return result;
  }
};