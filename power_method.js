(function() {

  this.power_method = function(A, x, maxiter, epsilon, teststeps) {
    var err, scale, x_new, n, m = A.length;
    for (n = 0; n < maxiter; n++) {
      x_new = numeric.dotMV(A, x);
      // can also use norminf
      scale = numeric.norm2(x_new);
      // standardize the sign
      numeric.diveq(x_new, (x_new[0] < 0) ? -scale : scale);
      // early termination test.
      if (n % teststeps === 0) {
        err = numeric.norm2Squared(numeric.sub(x_new, x));
        if (err < epsilon) break;
      }
      x = x_new;
    }
    return [scale, x_new];
  };

  this.inverse_power_method = function(A, x, maxiter, epsilon, teststeps) {
    // essentially the same as power_method, except we solve A*x_new = x
    var LU = numeric.LU(A);
    var err, scale, x_new, n, m = A.length;
    for (n = 0; n < maxiter; n++) {
      x_new = numeric.LUsolve(LU, x);
      scale = numeric.norm2(x_new);
      numeric.diveq(x_new, (x_new[0] < 0) ? -scale : scale);
      // early termination test.
      if (n % teststeps === 0) {
        err = numeric.norm2Squared(numeric.sub(x_new, x));
        if (err < epsilon) break;
      }
      x = x_new;
    }
    return [1 / scale, x_new];
  };

  function outer_product(xs, ys) {
    var i, j, xlen = xs.length, ylen = ys.length;
    var x, row, results = [];
    for (i = 0; i < xlen; i++) {
      x = xs[i];
      row = []
      for (j = 0; j < ylen; j++) {
        row.push(x * ys[j]);
      }
      results.push(row);
    }
    return results;
  };

  this.hotelling_deflation = function(A, num_vecs, maxiter, epsilon, teststeps) {
    // note: only for symmetric matrices
    var x0 = numeric.random([A.length]);
    var vals = [], vecs = [];
    var i, tmp, val, vec, xxT;
    for (i = 1; i <= num_vecs; i++) {
      tmp = power_method(A, x0, maxiter, epsilon, teststeps);
      vals.push(val = tmp[0]);
      vecs.push(vec = tmp[1]);
      if (i === num_vecs) {
        break;
      }
      xxT = outer_product(vec, vec);
      // Note: I've seen a couple variations of the following line:
      //   A -= val * xxT (used below)
      //   A -= val / xTx * xxT
      //   A -= xxT * A * xxT
      numeric.subeq(A, numeric.mul(val, xxT));
    }
    return [vals, vecs];
  };

  this.mca = function(A, num_vecs, maxiter, epsilon, teststeps) {
    var x0 = numeric.random([A.length]);
    var max_eigenvalue = power_method(A, x0, maxiter, epsilon, teststeps)[0] + 2 * epsilon;
    var vals = [], vecs = [];
    var i, val, vecs, xTx, xxT;
    for (i = 1; i <= num_vecs; i++) {
      tmp = inverse_power_method(A, x0, maxiter, epsilon, teststeps);
      vals.push(val = tmp[0]);
      vecs.push(vec = tmp[1]);
      if (i === num_vecs) {
        break;
      }
      xxT = outer_product(vec, vec);
      xTx = numeric.dotVV(vec, vec);
      numeric.addeq(A, numeric.mul(max_eigenvalue, numeric.div(xxT, xTx)));
    }
    return [vals, vecs];
  };

}).call(this);
