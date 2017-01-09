describe("Engine.Geometry.Circle class", function() {
  beforeEach(function() {
    this.circle = new Engine.Geometry.Circle(1, 1, 5, 0, 1.5 * Math.PI);
  });

  describe("getX method", function() {
    describe("given inranged rad", function() {
      it("returns x", function() {
        expect(this.circle.getX(0 * Math.PI)).toBeCloseTo(6);
        expect(this.circle.getX(0.5 * Math.PI)).toBeCloseTo(1);
        expect(this.circle.getX(1 * Math.PI)).toBeCloseTo(-4);
        expect(this.circle.getX(1.5 * Math.PI)).toBeCloseTo(1);
      });
    });

    describe("given outranged rad", function() {
      it("returns nothing", function() {
        expect(this.circle.getX(2 * Math.PI)).toBeUndefined();
      });
    });
  });

  describe("getY method", function() {
    describe("given inranged rad", function() {
      it("returns y", function() {
        expect(this.circle.getY(0 * Math.PI)).toBeCloseTo(1);
        expect(this.circle.getY(0.5 * Math.PI)).toBeCloseTo(6);
        expect(this.circle.getY(1 * Math.PI)).toBeCloseTo(1);
        expect(this.circle.getY(1.5 * Math.PI)).toBeCloseTo(-4);
      });
    });

    describe("given outranged rad", function() {
      it("returns nothing", function() {
        expect(this.circle.getY(2 * Math.PI)).toBeUndefined();
      });
    });
  });

  describe("getRad method", function() {
    describe("given inranged point", function() {
      it("returns rad", function() {
        let x = -3.0450849718747346;
        let y = 3.9389262614623686;
        expect(this.circle.getRad(x, y)).toBeCloseTo(0.8 * Math.PI);
      });
    });

    describe("given outranged point", function() {
      it("returns nothing", function() {
        let x = 5.045084971874736;
        let y = -1.9389262614623664;
        expect(this.circle.getRad(x, y)).toBeUndefined();
      });
    });
  });

  describe("getCircleIntersection method", function() {
    describe("given circle with 2 intersection points", function() {
      it("returns array with intersection points", function() {
        let circle = new Engine.Geometry.Circle(-5, 1, 5, 0, 2 * Math.PI);

        expect(this.circle.getCircleIntersection(circle)).toEqual([
          { x: -2, y: -3 },
          { x: -2, y: 5 }
        ]);
      });
    });

    describe("given circle with 1 intersection points", function() {
      it("returns array with intersection point", function() {
        let circle = new Engine.Geometry.Circle(-5, 1, 5, 0, 1 * Math.PI);

        expect(this.circle.getCircleIntersection(circle)).toEqual([
          { x: -2, y: 5 }
        ]);
      });
    });

    describe("given kissing circle", function() {
      it("returns array with intersection point", function() {
        let circle = new Engine.Geometry.Circle(-9, 1, 5, 0, 2 * Math.PI);

        expect(this.circle.getCircleIntersection(circle)).toEqual([
          { x: -4, y: 1 }
        ]);
      });
    });

    describe("given outer circle", function() {
      it("returns nothing", function() {
        let circle = new Engine.Geometry.Circle(10, 10, 2, 0, 2 * Math.PI);
        expect(this.circle.getCircleIntersection(circle)).toBeUndefined();
      });
    });

    describe("given inner circle", function() {
      it("nothing", function() {
        let circle = new Engine.Geometry.Circle(1, 1, 2, 0, 2 * Math.PI);
        expect(this.circle.getCircleIntersection(circle)).toBeUndefined();
      });
    });
  });

  describe("getLineIntersection method", function() {
    describe("given line with 2 intersection points", function() {
      it("returns array with intersection points", function() {
        let line = new Engine.Geometry.Line(-10, 1, 10, 1);

        expect(this.circle.getLineIntersection(line)).toEqual([
          { x: 6, y: 1 },
          { x: -4, y: 1 }
        ]);
      });
    });

    describe("given line with 1 intersection point", function() {
      it("returns array with intersection point", function() {
        let line = new Engine.Geometry.Line(-10, 1, 1, 1);

        expect(this.circle.getLineIntersection(line)).toEqual([
          { x: -4, y: 1 }
        ]);
      });
    });

    describe("given kissing line", function() {
      it("returns array with intersection point", function() {
        let line = new Engine.Geometry.Line(-10, 6, 10, 6);

        expect(this.circle.getLineIntersection(line)).toEqual([
          { x: 1, y: 6 }
        ]);
      });
    });

    describe("given outranged line", function() {
      it("returns nothing", function() {
        let line = new Engine.Geometry.Line(-10, 10, 10, 10);
        expect(this.circle.getLineIntersection(line)).toBeUndefined();
      });
    });
  });
});