(function() {

  this.isomap = function(nn_inds, dists, dim) {
    var geodesic = adj_matrix(nn_inds, dists);
    // fill out matrix with shortest path distances
    floyd_warshall(geodesic);
    // do classical MDS
    return mds(geodesic, dim);
  };

  function floyd_warshall(dists) {
    var n = dists.nr, n1 = n-1, data = dists.data;
    var k, i, j, d, di, dk, dik;
    for (k = 0; k < n; k++) {
      dk = dists.row(k);
      for (i = 0; i < n1; i++) {
        di = dists.row(i);
        dik = di[k];
        if (dik === Infinity) continue;
        for (j = i+1; j < n; j++) {
          d = dik + dk[j];
          if (d < di[j]) {
            di[j] = d;
            data[j*n+i] = d;
          }
        }
      }
    }
  };

  function mean_center_sym(X) {
    var i, j, n = X.nr;
    // symmetric matrix means row_means == col_means
    var row_means = new Float32Array(n);
    for (i = 0; i < n; i++) {
      row_means[i] = numeric.mean(X.row(i));
    }
    // each row has the same number of elements, so this is ok
    var X_mean = numeric.mean(row_means);
    var data = X.data, idx = 0, mu_r;
    for (i = 0; i < n; i++) {
      mu_r = row_means[i];
      for (j = 0; j < n; j++) {
        data[idx++] -= mu_r + row_means[j] - X_mean;
      }
    }
  };

  function mds(dists, num_dims) {
    dists = dists.map(function(x){ return -0.5 * x * x; });
    mean_center_sym(dists);
    var tmp = hotelling_deflation(dists, num_dims, 100, 1e-12, 3),
        lambdas = tmp[0], E = tmp[1];
    for (var i = 0; i < num_dims; i++) {
      numeric.muleq(E.row(i), Math.sqrt(lambdas[i]));
    }
    return numeric.transpose(E);
  };

}).call(this);
