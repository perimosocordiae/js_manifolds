colormap = (x) ->
  # x is in the range [0,1]
  c = new THREE.Color()
  v = x * 4
  switch Math.floor(v)
    when 0 then c.setRGB 0, v, 1
    when 1 then c.setRGB 0, 1, 2 - v
    when 2 then c.setRGB v - 2, 1, 0
    when 3 then c.setRGB 1, 4 - v, 0
    else console.error "Bad arg to colormap(): #{x} not in [0,1]"
  c

v = (x, y, z) -> new THREE.Vector3(x, y, z)

va = (point) ->
  z = if (point.length is 2) then 0 else point[2]
  new THREE.Vector3(point[0], point[1], z)

axes = (xmin, xmax, ymin, ymax, zmin, zmax) ->
  origin = v(0, 0, 0)
  lineGeo = new THREE.Geometry()
  lineGeo.vertices.push v(xmin, 0, 0), v(xmax, 0, 0), origin, v(0, ymin, 0), v(0, ymax, 0), origin, v(0, 0, zmin), v(0, 0, zmax)
  lineMat = new THREE.LineBasicMaterial {color: 0x808080}
  line = new THREE.Line(lineGeo, lineMat)
  line.type = THREE.Lines
  line

@scatter = (data, nn_inds) ->
  n = data.length
  scatterPlot = new THREE.Object3D()
  scatterPlot.rotation.y = 0.5
  scatterPlot.add axes(-50, 50, -50, 50, -50, 50) unless nn_inds?
  mat = new THREE.PointsMaterial { vertexColors: true, size: 2 }
  pointGeo = new THREE.Geometry()
  for i,pt of data
    pointGeo.vertices.push va(pt)
    pointGeo.colors.push colormap(i / n)
  points = new THREE.Points(pointGeo, mat)
  scatterPlot.add points
  if nn_inds?
    # add lines between neighboring points
    lineMat = new THREE.LineBasicMaterial {color: 0x808080}

    for i,pt of data
      s_pt = va(pt)
      for neighbor in nn_inds[i]
        t_pt = va(data[neighbor])
        lineGeo = new THREE.Geometry()
        lineGeo.vertices.push s_pt, t_pt
        line = new THREE.Line(lineGeo, lineMat)
        scatterPlot.add line
  scatterPlot

