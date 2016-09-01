
# Order matters!
JS_SRC = numeric.js \
         util.js \
         power_method.js \
         isomap.js \
         laplacian_eigenmaps.js \
         scatterplot.js \
         main.js

.PHONY: dist clean
dist: manifolds.min.js
clean:
	rm -f manifolds.min.js

manifolds.min.js: $(JS_SRC) vendor/three.min.js
	uglifyjs $(JS_SRC) -mc | cat vendor/three.min.js - >$@

vendor/three.min.js:
	curl https://cdnjs.cloudflare.com/ajax/libs/three.js/r80/three.min.js >$@
