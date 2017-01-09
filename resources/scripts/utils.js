// A wrapper function for our utilities which will enable chaining
// e.g. Utils().mod().trim().isBetween()...
Utils = function Utils(context) {
  const chain = {};

  Object.keys(Utils).forEach((utilName) => {
    chain[utilName] = (...args) => {
      const result = Utils[utilName](context, ...args);
      return Utils(result);
    };
  });

  // Returns the result of the chaining
  chain.value = () => context;

  return chain;
};

// Fixed modulo method which can calculate modulo of negative numbers properly
// e.g. (-803).mod(800) returns 797
Utils.mod = function (context, num) {
  return ((context % num) + num) % num;
};

// Trims number and leaves the number of decimals specified.
// The "mode" argument specifies which math function should be invoked
// right after the number has been trimmed.
// e.g. 12.12345.trim(3, "ceil") returns 12.124
Utils.trim = function (context, decimals, mode = "round") {
  return Math[mode](context * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

// Tells if number is in specified range based on given precision.
// See the "compare" method for more information about precision
Utils.isBetween = function (context, num1, num2, precision) {
  return Utils.compare(context, Math.min(num1, num2), ">=", precision) &&
         Utils.compare(context, Math.max(num1, num2), "<=", precision);
};

// Initiates comparison operator between context number and a given number, only here
// a precision can be specified
Utils.compare = function (context, num, method, precision) {
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
        case "<": case "<=": return context <= num + Number.EPSILON;
        case ">": case ">=": return context >= num - Number.EPSILON;
        default: return Math.abs(context - num) <= Number.EPSILON;
      }
    // Pixel precision, round comparison
    case "px":
      switch (method) {
        case "<": case "<=": return Math.round(context) <= Math.round(num);
        case ">": case ">=": return Math.round(context) >= Math.round(num);
        default: return Math.round(context) == Math.round(num);
      }
    // Exact precision
    default:
      switch (method) {
        case "<": return context < num;
        case "<=": return context <= num;
        case ">": return context > num;
        case ">=": return context >= num;
        default: return context === num;
      }
  }
};