#pragma once

#include <vector>
#include <emscripten/val.h>
#include "../nullable.h"
#include "point.h"

namespace geometry {
  class Circle;
  class EMCircle;

  class Line {
  public:
    double _x1;
    double _y1;
    double _x2;
    double _y2;

    Line(double x1, double y1, double x2, double y2);

    Nullable<double> getMatchingX(double y);

    Nullable<double> getMatchingY(double x);

    bool hasPoint(double x, double y);

    bool boundsHavePoint(double x, double y);

    Nullable<Point> getIntersection(Line line);
  };

  class EMLine : public Line {
  public:
    using Line::Line;

    emscripten::val getMatchingX(double y);

    emscripten::val getMatchingY(double x);

    emscripten::val getIntersection(EMLine line);
  };
}