(function() {

  function colormap(x) {
    var c = new THREE.Color();
    var v = x * 4;
    switch (Math.floor(v)) {
      case 0:
        c.setRGB(0, v, 1);
        break;
      case 1:
        c.setRGB(0, 1, 2 - v);
        break;
      case 2:
        c.setRGB(v - 2, 1, 0);
        break;
      case 3:
        c.setRGB(1, 4 - v, 0);
        break;
      default:
        console.error("Bad arg to colormap(): " + x + " not in [0,1]");
    }
    return c;
  };

  function v(x, y, z) {
    return new THREE.Vector3(x, y, z);
  };

  function va(point) {
    var z = point.length === 2 ? 0 : point[2];
    return new THREE.Vector3(point[0], point[1], z);
  };

  function axes(xmin, xmax, ymin, ymax, zmin, zmax) {
    var origin = v(0, 0, 0);
    var lineGeo = new THREE.Geometry();
    lineGeo.vertices.push(
        v(xmin, 0, 0), v(xmax, 0, 0), origin,
        v(0, ymin, 0), v(0, ymax, 0), origin,
        v(0, 0, zmin), v(0, 0, zmax));
    var lineMat = new THREE.LineBasicMaterial({ color: 0x808080 });
    var line = new THREE.Line(lineGeo, lineMat);
    line.type = THREE.Lines;
    return line;
  };

  this.scatter = function(data, nn_inds) {
    var scatterPlot = new THREE.Object3D();
    scatterPlot.rotation.y = 0.5;
    if (nn_inds == null) {
      scatterPlot.add(axes(-50, 50, -50, 50, -50, 50));
    }
    var mat = new THREE.PointsMaterial({ vertexColors: true, size: 3 });
    var pointGeo = new THREE.Geometry();
    var i, n = data.nr;
    for (i = 0; i < n; i++) {
      pointGeo.vertices.push(va(data.row(i)));
      pointGeo.colors.push(colormap(i / n));
    }
    var points = new THREE.Points(pointGeo, mat);
    scatterPlot.add(points);
    if (nn_inds == null) {
      return scatterPlot;
    }
    // add lines between neighboring points
    var lineMat = new THREE.LineBasicMaterial({ color: 0x808080 });
    var s_pt, t_pt, nns, j, neighbor, lineGeo;
    for (i = 0; i < n; i++) {
      s_pt = va(data.row(i));
      nns = nn_inds[i];
      for (j = 0; j < nns.length; j++) {
        neighbor = nns[j];
        t_pt = va(data.row(neighbor));
        lineGeo = new THREE.Geometry();
        lineGeo.vertices.push(s_pt, t_pt);
        scatterPlot.add(new THREE.Line(lineGeo, lineMat));
      }
    }
    return scatterPlot;
  };

}).call(this);
