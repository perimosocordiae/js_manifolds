(function() {

  this.lapeig = function(nn_inds, dists, num_dims) {
    var L = adj_matrix(nn_inds, dists);
    // convert to normalized graph laplacian in-place
    laplacian(L);
    // run minor components analysis
    var vecs = mca(L, num_dims, 100, 1e-12, 3, 1e-6);
    return numeric.transpose(vecs);
  };

  function laplacian(adj) {
    var i, j, n = adj.nr;
    var d = new Float32Array(n);
    var x, row;
    for (i = 0; i < n; i++) {
      row = adj.row(i);
      x = 0;
      for (j = 0; j < n; j++) {
        if (row[j] < Infinity) {
          x += row[j];
        }
      }
      d[i] = Math.sqrt(x);
    }
    for (i = 0; i < n; i++) {
      row = adj.row(i);
      x = -d[i];
      for (j = 0; j < n; j++) {
        if (row[j] < Infinity) {
          row[j] /= x * d[j];
        } else {
          row[j] = 0;
        }
      }
      row[i] = 1;
    }
  };

}).call(this);
