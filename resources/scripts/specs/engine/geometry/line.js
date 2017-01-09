describe("Engine.Geometry.Line class", function() {
  beforeEach(function() {
    this.line = new Engine.Geometry.Line(-5, -5, 5, 5);
  });

  describe("getX method", function() {
    describe("given inranged y", function() {
      it("returns x", function() {
        expect(this.line.getX(1)).toBeCloseTo(1);
      });
    });

    describe("given outranged y", function() {
      it("returns nothing", function() {
        expect(this.line.getX(10)).toBeUndefined();
      });
    });
  });

  describe("getY method", function() {
    describe("given inranged x", function() {
      it("returns y", function() {
        expect(this.line.getY(1)).toBeCloseTo(1);
      });
    });

    describe("given outranged x", function() {
      it("returns nothing", function() {
        expect(this.line.getY(10)).toBeUndefined();
      });
    });
  });

  describe("hasPoint method", function() {
    describe("given contained point", function() {
      it("returns true", function() {
        let x = 1;
        let y = 1;
        expect(this.line.hasPoint(x, y)).toBeTruthy();
      });
    });

    describe("given uncontained point", function() {
      it("returns false", function() {
        let x = 10;
        let y = 10;
        expect(this.line.hasPoint(x, y)).toBeFalsy();
      });
    });
  });

  describe("getLineIntersection method", function() {
    describe("given intersecting line", function() {
      it("returns intersection point", function() {
        let line = new Engine.Geometry.Line(1, -5, 1, 5);

        expect(this.line.getLineIntersection(line)).toEqual({
          x: 1,
          y: 1
        });
      });
    });

    describe("given parallel line", function() {
      it("returns nothing", function() {
        let line = new Engine.Geometry.Line(-5, -6, 5, 4);
        expect(this.line.getLineIntersection(line)).toBeUndefined();
      });
    });

    describe("given outranged line", function() {
      it("returns nothing", function() {
        let line = new Engine.Geometry.Line(10, 10, 10, 15);
        expect(this.line.getLineIntersection(line)).toBeUndefined();
      });
    });
  });
});