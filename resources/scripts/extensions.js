Object.defineProperties(Number.prototype, {
  // Fixed modulo method which can calculate modulo of negative numbers properly
  // e.g., (-803).mod(800) returns 797
  "mod": {
    value(num) {
      return ((this % num) + num) % num;
    }
  },

  // Trims number and leaves the number of decimals specified.
  // The "mode" argument specifies which math function should be invoked
  // right after the number has been trimmed.
  // e.g. 12.12345.trim(3, "ceil") returns 12.124
  "trim": {
    value(decimals, mode = "round") {
      return Math[mode](this * Math.pow(10, decimals)) / Math.pow(10, decimals);
    }
  },

  // Tells if number is in specified range based on given precision.
  // See the "compare" method for more information about precision
  "isBetween": {
    value(num1, num2, precision) {
      return this.compare(Math.min(num1, num2), ">=", precision) &&
      this.compare(Math.max(num1, num2), "<=", precision);
    }
  },

  // Initiates comparison operator between this number and a given number, only here
  // a precision can be specified
  "compare": {
    value(num) {
      switch (arguments.length) {
        case 2:
          var precision = arguments[1];
          break;
        case 3:
          var method = arguments[1];
          precision = arguments[2];
          break;
      }

      switch (precision) {
        // Fixed precision, "almost equal" with a deviation of ε
        case "f":
          switch (method) {
            case "<": case "<=": return this <= num + Number.EPSILON;
            case ">": case ">=": return this >= num - Number.EPSILON;
            default: return Math.abs(this - num) <= Number.EPSILON;
          }
        // Pixel precision, round comparison
        case "px":
          switch (method) {
            case "<": case "<=": return Math.round(this) <= Math.round(num);
            case ">": case ">=": return Math.round(this) >= Math.round(num);
            default: return Math.round(this) == Math.round(num);
          }
        // Exact precision
        default:
          switch (method) {
            case "<": return this < num;
            case "<=": return this <= num;
            case ">": return this > num;
            case ">=": return this >= num;
            default: return this === num;
          }
      }
    }
  }
});