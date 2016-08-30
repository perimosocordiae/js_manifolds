(function() {

  function _comb_graph_laplacian(dists) {
    var L = numeric.mul(dists, -1);
    var n = dist.length;
    for (var i = 0; i < n; i++) {
      L[i][i] = numeric.sum(dists[i]) + 1e-10;
    }
    return L;
  };

  function _normed_graph_laplacian(dists) {
    var n = dists.length;
    var d = [];
    for (i = 0; i < n; i++) {
      d.push(Math.sqrt(numeric.sum(dists[i])))
    }
    var L = numeric.clone(dists);
    for (i = 0; i < n; i++) {
      for (j = 0; j < n; j++) {
        L[i][j] /= -d[i] * d[j];
      }
      L[i][i] = 1;
    }
    return L;
  };

  this.lapeig = function(dists, num_dims, axis_scale) {
    if (axis_scale == null) {
      axis_scale = 50;
    }
    var L = _normed_graph_laplacian(dists);
    var tmp = mca(L, num_dims + 1, 100, 1e-12, 3),
        lambda = tmp[0],
        E = tmp[1];
    var start_idx = 0;
    for (var i = 0; i <= num_dims; i++) {
      if (lambda[i] < 1e-6) {
        start_idx++;
        continue;
      }
      numeric.muleq(E[i], axis_scale / numeric.norminf(E[i]));
    }
    E.splice(0, start_idx);
    return numeric.transpose(E);
  };

}).call(this);
