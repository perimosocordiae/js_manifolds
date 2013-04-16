
@isomap = (nn_inds, dists, dim) ->
  # create geodesic distance matrix
  n = dists.length
  geodesic = []
  for nns,i in nn_inds
    geodesic.push row = (Infinity for _ in [0...n] by 1)
    for j in nns
      row[j] = dists[i][j]
    row[i] = 0
  # hacky symmetrization
  for i in [0...n] by 1
    for j in [0...n] by 1
      tmp = geodesic[j][i] is Infinity
      if geodesic[i][j] is Infinity
        geodesic[i][j] = geodesic[j][i] unless tmp
      else
        geodesic[j][i] = geodesic[i][j] if tmp
  # fill out matrix with shortest path distances
  floyd_warshall(geodesic)
  # do classical MDS
  return mds(geodesic, dim)

floyd_warshall = (dists) ->
  n = dists.length
  for k in [0...n] by 1
    for i in [0...n] by 1
      for j in [0...n] by 1
        d = dists[i][k] + dists[k][j]
        dists[i][j] = dists[j][i] = d if d < dists[i][j]
  return dists

mean = (arr) -> numeric.sum(arr) / arr.length

mean_center = (X) ->
  n = X.length
  row_means = (mean(row) for row in X)
  col_means = (mean(col) for col in numeric.transpose(X))
  X_mean = mean(row_means)  # each row has the same # elements, so this is ok
  for i in [0...n] by 1
    for j in [0...n] by 1
      X[i][j] -= row_means[i] + col_means[j] - X_mean
  return X

mds = (dists, num_dims, axis_scale=50) ->
  dists = numeric.mul(-0.5, numeric.pow(dists, 2))
  mean_center(dists)
  [lambda,E] = hotelling_deflation(dists, num_dims, 100, 1e-12, 3)
  for i in [0...num_dims]
    numeric.muleq(E[i], axis_scale / numeric.norminf(E[i]))
  return numeric.transpose(E)
