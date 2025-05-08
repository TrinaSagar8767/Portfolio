export const math = (function() {
  //math function exports for convenience
  return {
    rand_range: function(a, b) {
      //custom rand range function for convenience
      return Math.random()*(b-a)+a;
    },

    rand_normalish: function() {
      const r = Math.random() + Math.random() + Math.random() + Math.random();
      return (r / 4.0) * 2.0 - 1;
    },

    rand_int: function(a, b) {
      return Math.round(Math.random()*(b-a)+a);
    },
    //lerp function for smoothness
    lerp: function(x, a, b) {
      return x*(b-a)+a;
    },

    //smooth step functions
    smoothstep: function(x, a, b) {
      x = x * x * (3.0 - 2.0 * x);
      return x*(b-a)+a;
    },

    smootherstep: function(x, a, b) {
      x = x * x * x * (x * (x * 6 - 15) + 10);
      return x * (b-a)+a;
    },

    clamp: function(x, a, b) {
      return Math.min(Math.max(x, a), b);
    },

    sat: function(x) {
      return Math.min(Math.max(x, 0.0), 1.0);
    },
  };
})();
