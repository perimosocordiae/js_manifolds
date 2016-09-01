(function() {
  var coords, dists, nn_inds;
  var render_orig, render_knn, render_isomap, render_lapeig;
  window.onload = function() {
    render_orig = init_view("orig", 400);
    render_knn = init_view("nng", 400);
    render_isomap = init_view("isomap", 400);
    render_lapeig = init_view("lapeig", 400);
    resetSwissRoll();
  };

  this.resetSwissRoll = function() {
    var tic = new Date().getTime();
    coords = swiss_roll(+(document.getElementById("numPoints").value));
    var toc = new Date().getTime();
    console.log('swiss_roll:', toc-tic);
    render_orig(scatter(coords));
    setTimeout(resetKNN, 0);
  };

  this.resetKNN = function() {
    var tic = new Date().getTime();
    var tmp = knn(coords, +(document.getElementById("knn").value));
    var toc = new Date().getTime();
    console.log('knn:', toc-tic);
    nn_inds = tmp[0];
    dists = tmp[1];
    render_knn(scatter(coords, nn_inds));

    setTimeout(resetIsomap, 0);
    setTimeout(resetLapeig, 0);
  };

  this.resetIsomap = function() {
    var tic = new Date().getTime();
    var emb = isomap(nn_inds, dists, 2);
    var toc = new Date().getTime();
    console.log('isomap:', toc-tic);
    scale_dimensions(emb, 50);
    render_isomap(scatter(emb, nn_inds));
  }

  this.resetLapeig = function() {
    var tic = new Date().getTime();
    var emb = lapeig(nn_inds, dists, 2);
    var toc = new Date().getTime();
    console.log('lapeig:', toc-tic);
    scale_dimensions(emb, 50);
    render_lapeig(scatter(emb, nn_inds));
  }

  function init_view(elt_id, size) {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, 1, 1, 10000);
    camera.position.z = 150;

    var renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(size, size);
    renderer.setClearColor(0xEEEEEE, 1.0);
    renderer.clear();
    renderer.render(scene, camera);

    function draw_scene() {
      renderer.clear();
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
    };

    var parent_elt = document.getElementById(elt_id);
    parent_elt.innerHTML = "";
    parent_elt.appendChild(renderer.domElement);

    function render(obj) {
      var down = false, sx = 0, sy = 0;
      parent_elt.onmouseup = function() { down = false; };
      parent_elt.onmousedown = function(ev) {
        down = true;
        sx = ev.clientX;
        sy = ev.clientY;
      };
      parent_elt.onmousemove = function(ev) {
        if (!down) return;
        var dx = ev.clientX - sx;
        var dy = ev.clientY - sy;
        obj.rotation.y += dx * 0.01;
        camera.position.y += dy;
        sx += dx;
        sy += dy;
        draw_scene();
      };

      // clear any existing scene contents
      for (var i = scene.children.length-1; i >= 0; i--) {
        scene.remove(scene.children[i]);
      }
      scene.add(obj);
      draw_scene();
    };

    return render;
  }

}).call(this);
