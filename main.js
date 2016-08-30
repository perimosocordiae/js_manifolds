(function() {

  this.resetSwissRoll = function() {
    window.data = swiss_roll(+(document.getElementById("numPoints").value));
    render(scatter(data), document.getElementById("orig"), 400);
    setTimeout(resetKNN, 0);
  };

  this.resetKNN = function() {
    var tmp = knn(window.data, +(document.getElementById("knn").value)),
        nn_inds = tmp[0],
        dists = tmp[1];
    render(scatter(data, nn_inds), document.getElementById("nng"), 400);
    setTimeout((function() {
      var embedded_data = isomap(nn_inds, dists, 2);
      render(scatter(embedded_data), document.getElementById("isomap"), 400);
    }), 0);
    setTimeout((function() {
      var embedded_data = lapeig(dists, 2);
      render(scatter(embedded_data), document.getElementById("lapeig"), 400);
    }), 0);
  };

  function render(obj, parent_elt, size) {
    parent_elt.innerHTML = "";
    var renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(size, size);
    parent_elt.appendChild(renderer.domElement);
    renderer.setClearColor(0xEEEEEE, 1.0);
    renderer.clear();
    var camera = new THREE.PerspectiveCamera(45, 1, 1, 10000);
    camera.position.z = 150;
    var scene = new THREE.Scene();
    scene.add(obj);
    renderer.render(scene, camera);
    function animate() {
      renderer.clear();
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
    };
    var down = false, sx = 0, sy = 0;
    parent_elt.onmousedown = function(ev) {
      down = true;
      sx = ev.clientX;
      sy = ev.clientY;
    };
    parent_elt.onmouseup = function() {
      down = false;
    };
    parent_elt.onmousemove = function(ev) {
      if (!down) return;
      var dx = ev.clientX - sx;
      var dy = ev.clientY - sy;
      obj.rotation.y += dx * 0.01;
      camera.position.y += dy;
      sx += dx;
      sy += dy;
      animate();
    };
    animate();
  };

  window.onload = resetSwissRoll;

}).call(this);