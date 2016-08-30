(function() {
  this.swiss_roll = function(N) {
    if (N == null) {
      N = 500;
    }
    var r = numeric.linspace(0, 1, N);
    var t = numeric.mul(3 * Math.PI / 2, numeric.add(1, numeric.mul(2, r)));
    var x = numeric.mul(3, numeric.mul(t, numeric.cos(t)));
    var y = numeric.mul(3, numeric.mul(t, numeric.sin(t)));
    var z = numeric.add(-30, numeric.mul(60, numeric.random([N])));
    return numeric.transpose([x, y, z]);
  };

  this.argsort = function(lst, reverse) {;
    if (reverse == true) {
      function cmp(a, b) { return lst[b] - lst[a]; }
    } else {
      function cmp(a, b) { return lst[a] - lst[b]; }
    }
    var n = lst.length;
    var inds = numeric.linspace(0, n - 1, n)
    return inds.sort(cmp);
  };

  this.knn = function(data, k) {
    var n = data.length;
    var dists = numeric.sub(numeric.identity(n), 1);
    var a, d, i, j;
    for (i = 0; i < n; i++) {
      a = data[i];
      for (j = 0; j < i; j++) {
        d = numeric.norm2Squared(numeric.sub(a, data[j]));
        dists[i][j] = dists[j][i] = d;
      }
    }
    var row, results = [];
    for (i = 0; i < n; i++) {
      row = dists[i];
      results.push(argsort(row).slice(1, k+1));
    }
    return [results, dists];
  };

}).call(this);
