#pragma once

template <typename T>
class Nullable {
private:
  T _value;
  bool _initialized;

public:
  Nullable(T value);

  Nullable();

  T getValue() const;

  void setValue(T value);

  void resetValue();

  bool hasValue() const;

  bool isNull() const;
};