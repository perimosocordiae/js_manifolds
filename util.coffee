
@swiss_roll = (N) ->
  N ?= 500
  r = numeric.linspace(0,1,N)
  t = numeric.mul(3*Math.PI/2, numeric.add(1,numeric.mul(2,r)))
  x = numeric.mul(3, numeric.mul(t, numeric.cos(t)))
  y = numeric.mul(3, numeric.mul(t, numeric.sin(t)))
  z = numeric.add(-30, numeric.mul(60, numeric.random([N])))
  return numeric.transpose([x,y,z])

sse_dist = (a,b) -> numeric.norm2Squared(numeric.sub(a,b))

@argsort = (lst, reverse=false) ->
  n = lst.length
  inds = numeric.linspace(0,n-1,n)
  if reverse
    inds.sort((a,b) -> lst[b] - lst[a])
  else
    inds.sort((a,b) -> lst[a] - lst[b])

@knn = (data, k) ->
  n = data.length
  # hacky way to get zeros on the diagonal
  dists = numeric.sub(numeric.identity(n), 1)
  for i in [0...n] by 1
    a = data[i]
    for j in [0...i] by 1
      d = sse_dist(a, data[j])
      dists[i][j] = dists[j][i] = d
  return [(argsort(row).slice(1,k+1) for row in dists), dists]

