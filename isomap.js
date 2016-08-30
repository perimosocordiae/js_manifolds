(function() {

  this.isomap = function(nn_inds, dists, dim) {
    var i, j, k, n = dists.length;
    var nns, row, geodesic = [];
    // create geodesic distance matrix
    for (i = 0; i < n; i++) {
      nns = nn_inds[i];
      row = [];
      for (j = 0; j < n; j++) {
        row.push(Infinity);
      }
      for (j = 0; j < nns.length; j++) {
        k = nns[j];
        row[k] = dists[i][k];
      }
      row[i] = 0;
      geodesic.push(row);
    }
    // hacky symmetrization
    for (i = 0; i < n; i++) {
      for (j = 0; j < n; j++) {
        if (geodesic[i][j] === Infinity) {
          if (geodesic[j][i] !== Infinity) {
            geodesic[i][j] = geodesic[j][i];
          }
        } else if (geodesic[j][i] === Infinity) {
          geodesic[j][i] = geodesic[i][j];
        }
      }
    }
    // fill out matrix with shortest path distances
    floyd_warshall(geodesic);
    // do classical MDS
    return mds(geodesic, dim);
  };

  function floyd_warshall(dists) {
    var k, i, j, d, n = dists.length;
    for (k = 0; k < n; k++) {
      for (i = 0; i < n; i++) {
        for (j = 0; j < n; j++) {
          d = dists[i][k] + dists[k][j];
          if (d < dists[i][j]) {
            dists[i][j] = dists[j][i] = d;
          }
        }
      }
    }
    return dists;
  };

  function mean(arr) {
    return numeric.sum(arr) / arr.length;
  };

  function mean_center(X) {
    var i, j, n = X.length;
    var X_t = numeric.transpose(X);
    var row_means = [], col_means = [];
    for (i = 0; i < n; i++) {
      row_means.push(mean(X[i]));
      col_means.push(mean(X_t[i]));
    }
    // each row has the same number of elements, so this is ok
    var X_mean = mean(row_means);
    for (i = 0; i < n; i++) {
      for (j = 0; j < n; j++) {
        X[i][j] -= row_means[i] + col_means[j] - X_mean;
      }
    }
    return X;
  };

  function mds(dists, num_dims, axis_scale) {
    if (axis_scale == null) {
      axis_scale = 50;
    }
    dists = numeric.mul(-0.5, numeric.pow(dists, 2));
    mean_center(dists);
    var tmp = hotelling_deflation(dists, num_dims, 100, 1e-12, 3),
        lambda = tmp[0],
        E = tmp[1];
    for (var i = 0; i < num_dims; i++) {
      numeric.muleq(E[i], axis_scale / numeric.norminf(E[i]));
    }
    return numeric.transpose(E);
  };

}).call(this);
