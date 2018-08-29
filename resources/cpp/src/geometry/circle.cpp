#include <algorithm>
#include <cmath>
#include <vector>
#include <emscripten/bind.h>
#include <emscripten/val.h>
#include "../nullable.h"
#include "../utils.h"
#include "point.h"
#include "line.h"

namespace geometry {
  // x - The x value of the circle's center
  // y - The y value of the circle's center
  // r - The radius of the center
  // rad1 - The first radian of the circle, not necessarily its beginning
  // rad2 - The second radian of the circle, not necessarily its beginning
  Circle::Circle(double x, double y, double r, double rad1, double rad2) {
    _x = utils::trim(x, 9);
    _y = utils::trim(y, 9);
    _r = utils::trim(r, 9);

    // Trimming mode is done based on which radian represents the ending and which radian
    // represents the ending
    if (rad1 > rad2) {
      _rad1 = utils::trim(rad1, 9, "floor");
      _rad2 = utils::trim(rad2, 9, "ceil");
    }
    else {
      _rad1 = utils::trim(rad1, 9, "ceil");
      _rad2 = utils::trim(rad2, 9, "floor");
    }
  }

  // Gets the matching x value for the given radian
  Nullable<double> Circle::getMatchingX(double rad) {
    if (!utils::chain(rad)->trim(9)->isBetween(_rad1, _rad2)->result()) {
      return Nullable<double>();
    }

    return Nullable<double>(utils::trim((_r * std::cos(rad)) + _x, 9));
  }

  // Gets the matching y value for the given radian
  Nullable<double> Circle::getMatchingY(double rad) {
    if (!utils::chain(rad)->trim(9)->isBetween(_rad1, _rad2)->result()) {
      return Nullable<double>();
    }

    return Nullable<double>(utils::trim((_r * std::sin(rad)) + _y, 9));
  }

  // Gets the matching point for the given radian
  Nullable<Point> Circle::getMatchingPoint(double rad) {
    if (!utils::isBetween(rad, _rad1, _rad2)) {
      return Nullable<Point>();
    }

    return Nullable<Point>({
      utils::trim((_r * std::cos(rad)) + _x, 9),
      utils::trim((_r * std::sin(rad)) + _y, 9)
    });
  }

  // Gets the matching radian for the given point
  Nullable<double> Circle::getMatchingRad(double x, double y) {
    double rad = std::atan2(y - _y, x - _x);

    // If calculated radian is in circle's radian range, return it
    if (!std::isnan(rad) && utils::isBetween(rad, _rad1, _rad2)) {
      return Nullable<double>(rad);
    }

    // The calculated radian can still be in the circle's radian range in case one
    // of the radians is greater than 2 PIEs
    double greatestRad = std::abs(_rad1) > std::abs(_rad2) ? _rad1 : _rad2;

    // Check if the absolute radian is in the circle's radian range
    if (utils::chain(rad + (2 * M_PI * std::floor(greatestRad / (2 * M_PI))))
        ->trim(9)->isBetween(_rad1, _rad2)->result() ||
        utils::chain(rad + (2 * M_PI * std::ceil(greatestRad / (2 * M_PI))))
        ->trim(9)->isBetween(_rad1, _rad2)->result()) {
      return Nullable<double>(rad);
    }

    return Nullable<double>();
  }

  // Returns if circle has given points
  bool Circle::hasPoint(double x, double y) {
    return getMatchingRad(x, y).hasValue();
  }

  // circle - circle intersection method
  Nullable<std::vector<Point>> Circle::getIntersection(Circle circle) {
    double dx = circle._x - _x;
    double dy = circle._y - _y;
    double d = std::sqrt(std::pow(dx, 2) + std::pow(dy, 2));

    if (d > _r + circle._r ||
       d < std::abs(_r - circle._r)) {
      return Nullable<std::vector<Point>>();
    }

    double a = ((std::pow(_r, 2) - std::pow(circle._r, 2)) + std::pow(d, 2)) / (2 * d);
    double x = _x + ((dx * a) / d);
    double y = _y + ((dy * a) / d);
    double h = std::sqrt(std::pow(_r, 2) - std::pow(a, 2));
    double rx = (- dy * h) / d;
    double ry = (dx * h) / d;

    std::vector<Point> interPoints(2);
    interPoints.at(0).x = x + rx;
    interPoints.at(0).y = y + ry;
    interPoints.at(1).x = x - rx;
    interPoints.at(1).y = y - ry;

    for (unsigned i = 0; i < interPoints.size(); i++) {
      Point& point = interPoints.at(i);
      point.x = utils::trim(point.x, 9);
      point.y = utils::trim(point.y, 9);
    }

    auto pointsBegin = std::unique(interPoints.begin(), interPoints.end(),
      [](Point pointA, Point pointB) {
        return pointA.x == pointB.x && pointA.y == pointB.y;
      }
    );

    interPoints.erase(pointsBegin, interPoints.end());

    std::vector<Circle> circles = { *this, circle };

    std::for_each(circles.begin(), circles.end(), [&interPoints](Circle circle) {
      auto pointsBegin = std::remove_if(interPoints.begin(), interPoints.end(),
        [&circle](Point point) {
          return !circle.hasPoint(point.x, point.y);
        }
      );

      interPoints.erase(pointsBegin, interPoints.end());
    });

    if (interPoints.size()) {
      return Nullable<std::vector<Point>>(interPoints);
    }

    return Nullable<std::vector<Point>>();
  }

  // circle - line intersection method
  Nullable<std::vector<Point>> Circle::getIntersection(Line line) {
    double x1 = line._x1 - _x;
    double x2 = line._x2 - _x;
    double y1 = line._y1 - _y;
    double y2 = line._y2 - _y;
    double dx = x2 - x1;
    double dy = y2 - y1;
    double d = std::sqrt(std::pow(dx, 2) + std::pow(dy, 2));
    double h = (x1 * y2) - (x2 * y1);
    double delta = (std::pow(_r, 2) * std::pow(d, 2)) - std::pow(h, 2);

    if (delta < 0) Nullable<std::vector<Point>>();

    double sign = dy / std::abs(dy); if (std::isnan(sign)) sign = 1;
    double sqrtx = sign * dx * std::sqrt(delta);
    double sqrty = std::abs(dy) * std::sqrt(delta);

    std::vector<Point> interPoints(2);
    interPoints.at(0).x = (((h * dy) + sqrtx) / std::pow(d, 2)) + _x;
    interPoints.at(0).y = (((-h * dx) + sqrty) / std::pow(d, 2)) + _y;
    interPoints.at(1).x = (((h * dy) - sqrtx) / std::pow(d, 2)) + _x;
    interPoints.at(1).y = (((-h * dx) - sqrty) / std::pow(d, 2)) + _y;

    for (unsigned i = 0; i < interPoints.size(); i++) {
      Point& point = interPoints.at(i);
      point.x = utils::trim(point.x, 9);
      point.y = utils::trim(point.y, 9);
    }

    auto pointsBegin = std::remove_if(interPoints.begin(), interPoints.end(),
      [this, &line](Point point) {
        return !hasPoint(point.x, point.y) ||
          !line.boundsHavePoint(point.x, point.y);
      }
    );

    interPoints.erase(pointsBegin, interPoints.end());

    pointsBegin = std::unique(interPoints.begin(), interPoints.end(),
      [](Point pointA, Point pointB) {
        return pointA.x == pointB.x && pointA.y == pointB.y;
      }
    );

    interPoints.erase(pointsBegin, interPoints.end());

    if (interPoints.size()) {
      return Nullable<std::vector<Point>>(interPoints);
    }

    return Nullable<std::vector<Point>>();
  }

  emscripten::val EMCircle::getMatchingX(double y) {
    Nullable<double> nullableX = Circle::getMatchingX(y);
    return nullableX.hasValue() ?
      emscripten::val(nullableX.getValue()) :
      emscripten::val::undefined();
  }

  emscripten::val EMCircle::getMatchingY(double x) {
    Nullable<double> nullableY = Circle::getMatchingY(x);
    return nullableY.hasValue() ?
      emscripten::val(nullableY.getValue()) :
      emscripten::val::undefined();
  }

  emscripten::val EMCircle::getMatchingPoint(double rad) {
    Nullable<Point> nullablePoint = Circle::getMatchingPoint(rad);

    if (nullablePoint.isNull()) return emscripten::val::undefined();

    Point point = nullablePoint.getValue();
    emscripten::val emPoint = emscripten::val::object();
    emPoint.set("x", emscripten::val(point.x));
    emPoint.set("y", emscripten::val(point.y));
    return emPoint;
  }

  emscripten::val EMCircle::getMatchingRad(double x, double y) {
    Nullable<double> nullableRad = Circle::getMatchingRad(x, y);
    return nullableRad.hasValue() ?
      emscripten::val(nullableRad.getValue()) :
      emscripten::val::undefined();
  }

  emscripten::val EMCircle::getIntersection(EMLine emLine) {
    Line line = Line(emLine._x1, emLine._y1, emLine._x2, emLine._y2);
    Nullable<std::vector<Point>> nullablePoints = Circle::getIntersection(line);

    if (nullablePoints.isNull()) return emscripten::val::undefined();

    std::vector<Point> points = nullablePoints.getValue();
    emscripten::val emPoints = emscripten::val::array();

    for (unsigned i = 0; i < points.size(); i++) {
      Point point = points.at(i);
      emscripten::val emPoint = emscripten::val::object();
      emPoint.set("x", emscripten::val(point.x));
      emPoint.set("y", emscripten::val(point.y));
      emPoints.set(i, emPoint);
    }

    return emPoints;
  }

  emscripten::val EMCircle::getIntersection(EMCircle emCircle) {
    Circle circle = Circle(
      emCircle._x, emCircle._y, emCircle._r, emCircle._rad1, emCircle._rad2
    );
    Nullable<std::vector<Point>> nullablePoints = Circle::getIntersection(circle);

    if (nullablePoints.isNull()) return emscripten::val::undefined();

    std::vector<Point> points = nullablePoints.getValue();
    emscripten::val emPoints = emscripten::val::array();

    for (unsigned i = 0; i < points.size(); i++) {
      Point point = points.at(i);
      emscripten::val emPoint = emscripten::val::object();
      emPoint.set("x", emscripten::val(point.x));
      emPoint.set("y", emscripten::val(point.y));
      emPoints.set(i, emPoint);
    }

    return emPoints;
  }
}

EMSCRIPTEN_BINDINGS(geometry_circle_module) {
  emscripten::class_<geometry::Circle>("geometry_circle_base")
    .constructor<double, double, double, double, double>()
    .property<double>("x", &geometry::Circle::_x)
    .property<double>("y", &geometry::Circle::_y)
    .property<double>("r", &geometry::Circle::_r)
    .property<double>("rad1", &geometry::Circle::_rad1)
    .property<double>("rad2", &geometry::Circle::_rad2)
    .function("hasPoint", &geometry::Circle::hasPoint);

  emscripten::class_<geometry::EMCircle, emscripten::base<geometry::Circle>>("geometry_circle")
    .constructor<double, double, double, double, double>()
    .function("getX", &geometry::EMCircle::getMatchingX)
    .function("getY", &geometry::EMCircle::getMatchingY)
    .function("getPoint", &geometry::EMCircle::getMatchingPoint)
    .function("getRad", &geometry::EMCircle::getMatchingRad)
    .function("getLineIntersection",
      emscripten::select_overload<emscripten::val(geometry::EMLine)>(
        &geometry::EMCircle::getIntersection
      )
    )
    .function("getCircleIntersection",
      emscripten::select_overload<emscripten::val(geometry::EMCircle)>(
        &geometry::EMCircle::getIntersection
      )
    );
}