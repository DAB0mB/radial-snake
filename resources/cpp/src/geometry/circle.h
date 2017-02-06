#pragma once

#include <vector>
#include "../nullable.h"
#include "point.h"
#include "line.h"

namespace geometry {
  class Line;

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
}