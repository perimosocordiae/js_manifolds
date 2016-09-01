"use strict";

window.numeric = (function() {

  var matrix = function matrix(data, nr, nc) {
    this.data = data;
    this.nr = nr;
    this.nc = nc;
    this.length = data.length;
  };
  matrix.prototype.reduce = function(cb, init) {
    return this.data.reduce(cb, init);
  };
  matrix.prototype.map = function(cb) {
    return new matrix(this.data.map(cb), this.nr, this.nc);
  }
  matrix.prototype.row = function(i) {
    var start = i * this.nc;
    return this.data.subarray(start, start + this.nc);
  }
  matrix.prototype.rowslice = function(i, j) {
    j = Math.min(j, this.nr);
    var n = j - i;
    var start = i * this.nc;
    var end = j * this.nc;
    return new matrix(this.data.subarray(start, end), n, this.nc);
  }

  function to_matrix(obj) {
    if (obj instanceof matrix) return obj;
    var nr = obj.length, nc = obj[0].length;
    var data = new Float32Array(nr*nc);
    for (var i=0; i<nr; i++) {
      data.set(obj[i], i*nc);
    }
    return new matrix(data, nr, nc);
  }

  this.transpose = function(A) {
    var nc, nr, data, i, j;
    if (!(A instanceof matrix)) {
      nc = A.length;
      nr = A[0].length;
      data = new Float32Array(nr*nc);
      var idx = 0;
      for (j = 0; j < nr; j++) {
        for (i = 0; i < nc; i++) {
          data[idx++] = A[i][j];
        }
      }
      return new matrix(data, nr, nc);
    }
    data = A.data;
    nr = A.nr;
    nc = A.nc;
    var buf = new Float32Array(data.length);
    var idx = 0;
    for (i = 0; i < nr; i++) {
      for (j = 0; j < nc; j++) {
        buf[j*nr+i] = data[idx++];
      }
    }
    return new matrix(buf, nc, nr);
  };

  this.outer_product = function(xs, ys) {
    var xlen = xs.length, ylen = ys.length;
    var res = numeric.zeros(xlen, ylen),
        data = res.data,
        idx = 0,
        i, j, x;
    for (i = 0; i < xlen; i++) {
      x = xs[i];
      for (j = 0; j < ylen; j++) {
        data[idx++] = x * ys[j];
      }
    }
    return res;
  };

  function add(a, b) { return a + b; }
  function addSq(a, b) { return a + b*b; }
  function maxAbs(a, b) { return Math.max(a, Math.abs(b)); }
  this.sum = function(a) { return a.reduce(add, 0); };
  this.mean = function(a) { return a.reduce(add, 0) / a.length; }
  this.norm2 = function(a) { return Math.sqrt(a.reduce(addSq, 0)); };
  this.norminf = function(a) { return a.reduce(maxAbs, 0); };

  this.l2dist = function(a, b) {
    var x, d = 0, n = a.length;
    for (var i = 0; i < n; i++) {
      x = a[i] - b[i];
      d += x*x;
    }
    return Math.sqrt(d);
  }

  this.sin = function(a) { return a.map(Math.sin); };
  this.cos = function(a) { return a.map(Math.cos); };
  this.pow = function(a, exp) {
    return a.map(function(x){ return Math.pow(x, exp); });
  };

  this.random = function(n) {
    var arr = new Float32Array(n);
    for (var i = 0; i < n; i++) {
      arr[i] = Math.random();
    }
    return arr;
  };

  this.linspace = function(a, b, n) {
    var arr = new Float32Array(n);
    for (var i = 0; i < n; i++) {
      arr[i] = (i*b + (n-i)*a)/n;
    }
    return arr;
  };

  this.arange = function(a, b) {
    var i, x, arr = new Int32Array(b - a);
    for (i = 0, x = a; x < b; i++, x++) {
      arr[i] = x;
    }
    return arr;
  }

  this.zeros = function(n, m) {
    var data = new Float32Array(n*m);
    return new matrix(data, n, m);
  }

  this.identity = function(n) {
    var data = new Float32Array(n*n);
    for (var i = 0; i < n; i++) {
      data[i*n+i] = 1;
    }
    return new matrix(data, n, n);
  };

  this.clone = function(A) {
    if (A instanceof matrix) {
      return new matrix(new Float32Array(A.data), A.nr, A.nc);
    }
    return to_matrix(A);
  };

  this.mul = function(a, b) {
    if (a instanceof matrix || b.length === undefined) {
      return a.map(function(x){ return x*b; });
    }
    if (b instanceof matrix || a.length === undefined) {
      return b.map(function(x){ return a*x; });
    }
    if (a[0].length !== undefined) {
      return numeric.mul(to_matrix(a), b);
    }
    if (b[0].length !== undefined) {
      return numeric.mul(a, to_matrix(b));
    }
    var i, res = new Float32Array(a), n = res.length;
    for (i = 0; i < n; i++) {
      res[i] *= b[i];
    }
    return res;
  };

  this.div = function(a, b) {
    if (a instanceof matrix || b.length === undefined) {
      return a.map(function(x){ return x/b; });
    }
    if (b instanceof matrix || a.length === undefined) {
      return b.map(function(x){ return a/x; });
    }
    if (a[0].length !== undefined) {
      return numeric.div(to_matrix(a), b);
    }
    if (b[0].length !== undefined) {
      return numeric.div(a, to_matrix(b));
    }
    var i, res = new Float32Array(a), n = res.length;
    for (i = 0; i < n; i++) {
      res[i] /= b[i];
    }
    return res;
  };

  this.add = function(a, b) {
    if (a instanceof matrix || b.length === undefined) {
      return a.map(function(x){ return x+b; });
    }
    if (b instanceof matrix || a.length === undefined) {
      return b.map(function(x){ return a+x; });
    }
    if (a[0].length !== undefined) {
      return numeric.add(to_matrix(a), b);
    }
    if (b[0].length !== undefined) {
      return numeric.add(a, to_matrix(b));
    }
    var i, res = new Float32Array(a), n = res.length;
    for (i = 0; i < n; i++) {
      res[i] += b[i];
    }
    return res;
  };

  this.sub = function(a, b) {
    if (a instanceof matrix || b.length === undefined) {
      return a.map(function(x){ return x-b; });
    }
    if (b instanceof matrix || a.length === undefined) {
      return b.map(function(x){ return a-x; });
    }
    if (a[0].length !== undefined) {
      return numeric.sub(to_matrix(a), b);
    }
    if (b[0].length !== undefined) {
      return numeric.sub(a, to_matrix(b));
    }
    var i, res = new Float32Array(a), n = res.length;
    for (i = 0; i < n; i++) {
      res[i] -= b[i];
    }
    return res;
  };

  this.muleq = function(a, b) {
    if (a instanceof matrix) { a = a.data; }
    if (b instanceof matrix) { b = b.data; }
    var i, n = a.length;
    if (b.length !== undefined) {
      for (i = 0; i < n; i++) {
        a[i] *= b[i];
      }
    } else {
      for (i = 0; i < n; i++) {
        a[i] *= b;
      }
    }
  };

  this.diveq = function(a, b) {
    if (a instanceof matrix) { a = a.data; }
    if (b instanceof matrix) { b = b.data; }
    var i, n = a.length;
    if (b.length !== undefined) {
      for (i = 0; i < n; i++) {
        a[i] /= b[i];
      }
    } else {
      for (i = 0; i < n; i++) {
        a[i] /= b;
      }
    }
  };

  this.addeq = function(a, b) {
    if (a instanceof matrix) { a = a.data; }
    if (b instanceof matrix) { b = b.data; }
    var i, n = a.length;
    if (b.length !== undefined) {
      for (i = 0; i < n; i++) {
        a[i] += b[i];
      }
    } else {
      for (i = 0; i < n; i++) {
        a[i] += b;
      }
    }
  };

  this.subeq = function(a, b) {
    if (a instanceof matrix) { a = a.data; }
    if (b instanceof matrix) { b = b.data; }
    var i, n = a.length;
    if (b.length !== undefined) {
      for (i = 0; i < n; i++) {
        a[i] -= b[i];
      }
    } else {
      for (i = 0; i < n; i++) {
        a[i] -= b;
      }
    }
  };

  this.dotVV = function(a, b) {
    var x = 0;
    for (var i = 0, n = a.length; i < n; i++) {
      x += a[i] * b[i];
    }
    return x;
  };

  this.dotMV = function(A, x, out) {
    var i, n = A.nr;
    if (out === undefined) {
      out = new Float32Array(n);
    }
    for (i = 0; i < n; i++) {
      out[i] = numeric.dotVV(A.row(i), x);
    }
    return out;
  };

  this.LU = function(M) {
    var i, j, k, Pk, n = M.nr, n1 = n-1;
    var P = new Int32Array(n);
    var A = numeric.clone(M),
        Adata = A.data;
    var absAjk, Akk, Aik, Ak, Ai, max, tmp;

    for (k = 0; k < n; ++k) {
      Pk = k;
      Ak = A.row(k);
      max = Math.abs(Ak[k]);
      for (j = k + 1; j < n; ++j) {
        absAjk = Math.abs(Adata[j*n+k]);
        if (max < absAjk) {
          max = absAjk;
          Pk = j;
        }
      }
      P[k] = Pk;

      if (Pk != k) {
        // swap A[k] and A[Pk]
        Ai = A.row(Pk);
        for (j = 0; j < n; j++) {
          tmp = Ak[j];
          Ak[j] = Ai[j];
          Ai[j] = tmp;
        }
      }

      Akk = Ak[k];
      for (i = k + 1; i < n; ++i) {
        Ai = A.row(i);
        Aik = Ai[k] /= Akk;
        for (j = k + 1; j < n; ++j) {
          Ai[j] -= Aik * Ak[j];
        }
      }
    }
    return {LU: A, P: P};
  };

  this.LUsolve = function(LUP, b) {
    var LU = LUP.LU,
        P = LUP.P,
        x = new Float32Array(b),
        n = LU.nr;
    var i, j, Pi, LUi, LUii, tmp;
    for (i = 0; i < n; ++i) {
      Pi = P[i];
      if (Pi !== i) {
        tmp = x[i];
        x[i] = x[Pi];
        x[Pi] = tmp;
      }

      LUi = LU.row(i);
      tmp = 0;
      for (j = 0; j < i; ++j) {
        tmp += x[j] * LUi[j];
      }
      x[i] -= tmp;
    }
    for (i = n - 1; i >= 0; --i) {
      LUi = LU.row(i);
      tmp = 0;
      for (j = i + 1; j < n; ++j) {
        tmp += x[j] * LUi[j];
      }
      x[i] -= tmp;
      x[i] /= LUi[i];
    }
    return x;
  };

  return this;
}).call(this);
