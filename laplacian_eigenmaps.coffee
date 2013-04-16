root = exports ? this
if require?
  root.numeric = require './vendor/numeric-1.2.6.min.js'
  root.mca = require('./power_method').mca

_comb_graph_laplacian = (dists) ->
  # simple, combinatorial graph lapacian: L = D - A
  L = numeric.mul(dists, -1)
  for i in [0...dists.length] by 1
    # add epsilon to the diagonal for numerical stability in the LU decomp.
    L[i][i] = numeric.sum(dists[i]) + 1e-10
  return L

_normed_graph_laplacian = (dists) ->
  # normalized graph laplacian: D^-1/2 x W x D^-1/2
  d = (Math.sqrt(numeric.sum(row)) for row in dists)
  L = numeric.clone(dists)
  n = dists.length
  for i in [0...n] by 1
    for j in [0...n] by 1
      L[i][j] /= -d[i] * d[j]
    L[i][i] = 1
  return L

graph_laplacian = _normed_graph_laplacian

@lapeig = (dists, num_dims, axis_scale=50) ->
  L = graph_laplacian(dists)
  # ask for num_dims+1, because the first eigenvalue is zero
  [lambda,E] = root.mca(L, num_dims+1, 100, 1e-12, 3)
  start_idx = 0
  for i in [0..num_dims]
    unless lambda[i] > 1e-6
      start_idx++
      continue
    numeric.muleq(E[i], axis_scale / numeric.norminf(E[i]))
  # discard 0-ish eigenpairs
  E.splice(0, start_idx)
  return numeric.transpose(E)

if module? and require?.main == module
  A = [[0,1,3],[1,0,2],[3,2,0]]
  console.log numeric.prettyPrint A
  console.log numeric.prettyPrint graph_laplacian(A)
  console.log @lapeig(A, 2)
