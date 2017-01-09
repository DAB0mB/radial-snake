describe("Engine.Geometry.Polygon class", function() {
  beforeEach(function() {
    this.polygon = new Engine.Geometry.Polygon(
      [0, 0, 5, 0],
      [5, 0, 5, 5],
      [5, 5, 0, 5],
      [0, 5, 0, 0]
    );
  });

  describe("hasPoint method", function() {
    describe("given contained point", function() {
      it("returns true", function() {
        let x = 5;
        let y = 3;
        expect(this.polygon.hasPoint(x, y)).toBeTruthy();
      });
    });

    describe("given outranged point", function() {
      it("returns false", function() {
        let x = 10;
        let y = 10;
        expect(this.polygon.hasPoint(x, y)).toBeFalsy();
      });
    });
  });

  describe("getLineIntersection method", function() {
    describe("given intersecting line", function() {
      it("returns intersection point", function() {
        let line = new Engine.Geometry.Line(0, 1, 5, 4);

        expect(this.polygon.getLineIntersection(line)).toEqual([
          { x: 5, y: 4 },
          { x: -0, y: 1 }
        ]);
      });
    });

    describe("given outranged line", function() {
      it("returns nothing", function() {
        let line = new Engine.Geometry.Line(10, 11, 15, 14);

        expect(this.polygon.getLineIntersection(line)).toBeUndefined();
      });
    });
  });

  describe("getCircleIntersection method", function() {
    describe("given circle with 2 intersection points", function() {
      it("returns array with intersection points", function() {
        let circle = new Engine.Geometry.Circle(0, 0, 2, 0, 2 * Math.PI);

        expect(this.polygon.getCircleIntersection(circle)).toEqual([
          { x: 2, y: 0 },
          { x: 0, y: 2 }
        ]);
      });
    });

    describe("given circle with 1 intersection points", function() {
      it("returns array with intersection point", function() {
        let circle = new Engine.Geometry.Circle(0, 0, 2, 0, 0.25 * Math.PI);

        expect(this.polygon.getCircleIntersection(circle)).toEqual([
          { x: 2, y: 0 }
        ]);
      });
    });

    describe("given kissing circle", function() {
      it("returns array with intersection point", function() {
        let circle = new Engine.Geometry.Circle(-3, 3, 3, 0, 2 * Math.PI);

        expect(this.polygon.getCircleIntersection(circle)).toEqual([
          { x: 0, y: 3 }
        ]);
      });
    });

    describe("given outer circle", function() {
      it("returns nothing", function() {
        let circle = new Engine.Geometry.Circle(10, 10, 2, 0, 2 * Math.PI);
        expect(this.polygon.getCircleIntersection(circle)).toBeUndefined();
      });
    });

    describe("given inner circle", function() {
      it("nothing", function() {
        let circle = new Engine.Geometry.Circle(2.5, 2.5, 2, 0, 2 * Math.PI);
        expect(this.polygon.getCircleIntersection(circle)).toBeUndefined();
      });
    });
  });
});