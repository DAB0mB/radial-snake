#pragma once

#include <vector>
#include <emscripten/val.h>
#include "../nullable.h"
#include "point.h"
#include "line.h"

namespace geometry {
  class Line;
  class EMLine;

  class Circle {
  public:
    double _x;
    double _y;
    double _r;
    double _rad1;
    double _rad2;

    Circle(double x, double y, double r, double rad1, double rad2);

    Nullable<double> getMatchingX(double rad);

    Nullable<double> getMatchingY(double rad);

    Nullable<Point> getMatchingPoint(double rad);

    Nullable<double> getMatchingRad(double x, double y);

    bool hasPoint(double x, double y);

    Nullable<std::vector<Point>> getIntersection(Circle circle);

    Nullable<std::vector<Point>> getIntersection(Line line);
  };

  class EMCircle : public Circle {
  public:
    using Circle::Circle;

    emscripten::val getMatchingX(double y);

    emscripten::val getMatchingY(double x);

    emscripten::val getMatchingPoint(double rad);

    emscripten::val getMatchingRad(double x, double y);

    emscripten::val getIntersection(EMLine line);

    emscripten::val getIntersection(EMCircle circle);
  };
}