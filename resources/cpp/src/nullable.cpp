#include "nullable.h"

template <typename T>
Nullable<T>::Nullable(T value): _value(value), _initialized(true) {

}

template <typename T>
Nullable<T>::Nullable(): _initialized(false) {

}

template <typename T>
T Nullable<T>::getValue() const {
  return _value;
}

template <typename T>
void Nullable<T>::setValue(T value) {
  _value = value;
  _initialized = true;
}

template <typename T>
void Nullable<T>::resetValue() {
  _initialized = false;
}

template <typename T>
bool Nullable<T>::hasValue() const {
  return _initialized == true;
}

template <typename T>
bool Nullable<T>::isNull() const {
  return _initialized == false;
}