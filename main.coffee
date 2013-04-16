@resetSwissRoll = ->
  n = Number(document.getElementById("numPoints").value)
  window.data = swiss_roll(n)
  render scatter(data), document.getElementById("orig"), 400
  setTimeout resetKNN, 0

@resetKNN = ->
  k = Number(document.getElementById("knn").value)
  [nn_inds,dists] = knn(window.data, k)
  render scatter(data, nn_inds), document.getElementById("nng"), 400
  setTimeout (->
    embedded_data = isomap(nn_inds, dists, 2)
    render scatter(embedded_data), document.getElementById("isomap"), 400
  ), 0
  setTimeout (->
    embedded_data = lapeig(dists, 2)
    render scatter(embedded_data), document.getElementById("lapeig"), 400
  ), 0

render = (obj, parent_elt, size) ->
  # new THREE.PerspectiveCamera( FOV, viewAspectRatio, zNear, zFar );
  animate = ->
    renderer.clear()
    camera.lookAt scene.position
    renderer.render scene, camera
    window.requestAnimationFrame animate, renderer.domElement
  parent_elt.innerHTML = ""
  renderer = new THREE.WebGLRenderer(antialias: true)
  renderer.setSize size, size
  parent_elt.appendChild renderer.domElement
  renderer.setClearColorHex 0xEEEEEE, 1.0
  renderer.clear()
  camera = new THREE.PerspectiveCamera(45, 1, 1, 10000)
  camera.position.z = 150
  scene = new THREE.Scene()
  scene.add obj
  renderer.render scene, camera
  down = false
  sx = 0
  sy = 0
  parent_elt.onmousedown = (ev) ->
    down = true
    sx = ev.clientX
    sy = ev.clientY

  parent_elt.onmouseup = ->
    down = false

  parent_elt.onmousemove = (ev) ->
    return unless down
    dx = ev.clientX - sx
    dy = ev.clientY - sy
    obj.rotation.y += dx * 0.01
    camera.position.y += dy
    sx += dx
    sy += dy

  animate()

window.onload = ->
  resetSwissRoll()
