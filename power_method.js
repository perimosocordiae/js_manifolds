(function() {

  function power_method(A, x, maxiter, epsilon, teststeps) {
    x = new Float32Array(x);
    var x_new = new Float32Array(x.length);
    var err, scale;
    for (var it = 1; it <= maxiter; it++) {
      numeric.dotMV(A, x, x_new);
      // can also use norminf
      scale = numeric.norm2(x_new);
      // standardize the sign
      numeric.diveq(x_new, (x_new[0] < 0) ? -scale : scale);
      // early termination test.
      if (it % teststeps === 0) {
        err = numeric.l2dist(x_new, x);
        if (err < epsilon) break;
      }
      x.set(x_new);
    }
    return [scale, x_new];
  };

  function inverse_power_method(A, x, maxiter, epsilon, teststeps) {
    // essentially the same as power_method, except we solve A*x_new = x
    var LU = numeric.LU(A);
    var err, scale, x_new;
    for (var it = 1; it <= maxiter; it++) {
      x_new = numeric.LUsolve(LU, x);
      scale = numeric.norm2(x_new);
      numeric.diveq(x_new, (x_new[0] < 0) ? -scale : scale);
      // early termination test.
      if (it % teststeps === 0) {
        err = numeric.l2dist(x_new, x);
        if (err < epsilon) break;
      }
      x = x_new;
    }
    return [1 / scale, x_new];
  };

  this.hotelling_deflation = function(A, num_vecs, maxiter, epsilon, teststeps) {
    // note: assumes A is a symmetric matrix
    var x0 = numeric.random(A.nr);
    var vals = new Float32Array(num_vecs);
    var vecs = numeric.zeros(num_vecs, A.nr);
    var tmp, val, vec, xxT;
    for (var i = 0; i < num_vecs; i++) {
      tmp = power_method(A, x0, maxiter, epsilon, teststeps);
      vals[i] = val = tmp[0];
      vec = tmp[1];
      vecs.row(i).set(vec);
      if (i+1 === num_vecs) {
        break;
      }
      xxT = numeric.outer_product(vec, vec);
      // Note: I've seen a couple variations of the following line:
      //   A -= val * xxT (used below)
      //   A -= val / xTx * xxT
      //   A -= xxT * A * xxT
      numeric.subeq(A, numeric.mul(val, xxT));
    }
    return [vals, vecs];
  };

  this.mca = function(A, num_vecs, maxiter, epsilon, teststeps, valthresh) {
    var x0 = numeric.random(A.nr);
    var max_eigenvalue = power_method(A, x0, maxiter, epsilon, teststeps)[0]
    max_eigenvalue += 2 * epsilon;
    var vecs = numeric.zeros(num_vecs, A.nr);
    var i = 0, tmp, val, vec, xTx, xxT;
    while (i < num_vecs) {
      tmp = inverse_power_method(A, x0, maxiter, epsilon, teststeps);
      val = tmp[0];
      vec = tmp[1];
      if (val !== val) break;
      if (val > valthresh) {
        vecs.row(i).set(vec);
        i++;
      }
      if (i === num_vecs) break;
      xxT = numeric.outer_product(vec, vec);
      xTx = numeric.dotVV(vec, vec);
      numeric.addeq(A, numeric.mul(max_eigenvalue, numeric.div(xxT, xTx)));
    }
    return vecs;
  };

}).call(this);
