(function() {
  this.swiss_roll = function(N) {
    var r = numeric.linspace(0, 1, N);
    var t = numeric.mul(3 * Math.PI / 2, numeric.add(1, numeric.mul(2, r)));
    var x = numeric.mul(3, numeric.mul(t, numeric.cos(t)));
    var y = numeric.mul(3, numeric.mul(t, numeric.sin(t)));
    var z = numeric.add(-30, numeric.mul(60, numeric.random(N)));
    return numeric.transpose([x, y, z]);
  };

  function insort(items, x, k) {
    for (var i = 0; i < k; i++) {
      if (x < items[i]) {
        items.splice(i, 0, x);
        items.pop();
        return items[k-1];
      }
    }
    return items;
  }

  function pdist(data) {
    var i, j, n = data.nr;
    var dists = numeric.zeros(n, n);
    var a, di, dj;
    for (i = 0; i < n; i++) {
      a = data.row(i);
      di = dists.row(i);
      for (j = 0; j < i; j++) {
        dj = dists.row(j);
        di[j] = dj[i] = numeric.l2dist(a, data.row(j));
      }
      di[i] = 0;
    }
    return dists;
  }

  this.knn = function(data, k) {
    var dists = pdist(data);
    var n = dists.nr;
    var results = new Array(n);
    var minvals = new Array(k);
    var d, maxmin, min_k_idx, di;
    var j = 0;
    for (var i = 0; i < n; i++) {
      di = dists.row(i);
      minvals.fill(Infinity);
      maxmin = Infinity;
      for (j = 0; j < n; j++) {
        d = di[j];
        if (d > 0 && d < maxmin) {
          maxmin = insort(minvals, d, k);
        }
      }
      min_k_idx = [];
      for (j = 0; j < n; j++) {
        d = di[j];
        if (d > 0 && d <= maxmin) {
          min_k_idx.push(j);
        }
      }
      results[i] = min_k_idx;
    }
    return [results, dists];
  };

  this.scale_dimensions = function(X, scale) {
    var num_dims = X.nc,
        num_pts = X.nr;
    var col_mins = new Float32Array(num_dims),
        col_maxs = new Float32Array(num_dims);
    col_maxs.set(X.row(0));
    col_mins.set(col_maxs);
    var data = X.data;
    var i, j, x, idx = num_dims;
    for (i = 1; i < num_pts; i++) {
      for (j = 0; j < num_dims; j++) {
        x = data[idx++];
        if (x < col_mins[j]) {
          col_mins[j] = x;
        } else if (x > col_maxs[j]) {
          col_maxs[j] = x
        }
      }
    }
    // convert to 0,2 range
    var ranges = numeric.sub(col_maxs, col_mins);
    numeric.diveq(ranges, 2);
    idx = 0;
    for (i = 0; i < num_pts; i++) {
      for (j = 0; j < num_dims; j++) {
        data[idx] -= col_mins[j];
        data[idx++] /= ranges[j];
      }
    }
    // convert to -scale,+scale range
    numeric.subeq(data, 1);
    numeric.muleq(data, scale);
  }

  this.adj_matrix = function(nn_inds, dists) {
    var i, j, k, n = dists.nr;
    var nns, di, adj_i, adj_j;
    var adj = numeric.zeros(n, n);
    adj.data.fill(Infinity);
    for (i = 0; i < n; i++) {
      nns = nn_inds[i];
      di = dists.row(i);
      adj_i = adj.row(i);
      for (j = 0; j < nns.length; j++) {
        k = nns[j];
        adj_i[k] = di[k];
      }
      adj_i[i] = 0;
    }
    // symmetrize
    for (i = 0; i < n; i++) {
      adj_i = adj.row(i);
      for (j = 0; j < n; j++) {
        adj_j = adj.row(j);
        if (adj_i[j] === Infinity) {
          if (adj_j[i] !== Infinity) {
            adj_i[j] = adj_j[i];
          }
        } else if (adj_j[i] === Infinity) {
          adj_j[i] = adj_i[j];
        }
      }
    }
    return adj;
  }

}).call(this);
