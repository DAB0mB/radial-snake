#pragma once

#include <string>

namespace utils {
  template<typename T>
  class Chain {
  private:
    T _accumulator;

  public:
    Chain(T accumulator);

    Chain<double>* mod(double num);

    Chain<double>* trim(int decimals, const std::string mode = "round");

    Chain<bool>* isBetween(double num1, double num2, const std::string precision = "exact");

    Chain<bool>* compare(double num, const std::string precision = "exact");

    Chain<bool>* compare(double num, const std::string method, const std::string precision);

    T result();
  };

  template<typename T>
  Chain<T>* chain(T accumulator);

  double mod(double context, double num);

  double trim(double context, int decimals, const std::string mode = "round");

  bool isBetween(double context, double num1, double num2, const std::string precision = "exact");

  bool compare(double context, double num, const std::string precision = "exact");

  bool compare(double context, double num, const std::string method, const std::string precision);
}