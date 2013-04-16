root = exports ? this
root.numeric = require './vendor/numeric-1.2.6.min.js' if require?

@power_method = (A, x, maxiter, epsilon, teststeps) ->
  m  = A.length
  for n in [0...maxiter]
    x_new = numeric.dotMV A, x
    scale = numeric.norm2 x_new  # can also use norminf
    # standardize the sign
    scale *= -1 if x_new[0] < 0
    numeric.diveq x_new, scale
    # early termination test.
    if n % teststeps is 0
      err = numeric.norm2Squared numeric.sub x_new, x
      break if err < epsilon
    x = x_new
  return [scale, x_new]

@inverse_power_method = (A, x, maxiter, epsilon, teststeps) ->
  # essentially the same as power_method, except we solve A*x_new = x
  m = A.length
  LU = numeric.LU(A)
  for n in [0...maxiter]
    x_new = numeric.LUsolve(LU, x)
    scale = numeric.norm2 x_new
    scale *= -1 if x_new[0] < 0
    numeric.diveq x_new, scale
    if n % teststeps is 0
      err = numeric.norm2Squared numeric.sub x_new, x
      break if err < epsilon
    x = x_new
  return [1/scale, x_new]

outer_product = (xs,ys) -> ((x*y for x in xs) for y in ys)

# note: only for symmetric matrices
@hotelling_deflation = (A, num_vecs, maxiter, epsilon, teststeps) =>
  x0 = numeric.random([A.length])
  vals = []
  vecs = []
  for i in [1..num_vecs] by 1
    [val,vec] = @power_method(A, x0, maxiter, epsilon, teststeps)
    vals.push val
    vecs.push vec
    break if i is num_vecs
    xxT = outer_product vec, vec
    # xTx = numeric.dotVV vec, vec
    # Note: I've seen a couple variations of the following line:
    #   A -= val * xxT (used below)
    #   A -= val / xTx * xxT
    #   A -= xxT * A * xxT
    numeric.subeq A, numeric.mul val, xxT
  return [vals, vecs]

@mca = (A, num_vecs, maxiter, epsilon, teststeps) =>
  x0 = numeric.random([A.length])
  max_eigenvalue = @power_method(A, x0, maxiter, epsilon, teststeps)[0] + 2*epsilon
  vals = []
  vecs = []
  for i in [1..num_vecs] by 1
    [val,vec] = @inverse_power_method(A, x0, maxiter, epsilon, teststeps)
    vals.push val
    vecs.push vec
    break if i is num_vecs
    xxT = outer_product vec, vec
    xTx = numeric.dotVV vec, vec
    numeric.addeq A, numeric.mul max_eigenvalue, numeric.div xxT, xTx
  return [vals,vecs]

if module? and require?.main == module
  A = [[4,-1,1],[-1,3,-2],[1,-2,3]]
  [lambdas, vecs] = @hotelling_deflation(A, 3, 100, 1e-12, 3)
  console.log lambdas
  console.log numeric.transpose(vecs)
  console.log '------------------'
  A = [[4,-1,1],[-1,3,-2],[1,-2,3]]
  [lambdas, vecs] = @mca(A, 3, 100, 1e-12, 3)
  console.log lambdas
  console.log numeric.transpose(vecs)

