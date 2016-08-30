
# Order matters!
JS_SRC = vendor/three.min.js \
         vendor/numeric-1.2.6.min.js \
         util.js \
         power_method.js \
         isomap.js \
         laplacian_eigenmaps.js \
         scatterplot.js \
         main.js

.PHONY: dist dev clean
dev: $(JS_SRC)
dist: manifolds.min.js
clean:
	rm -f manifolds.js manifolds.min.js

manifolds.js: $(JS_SRC)
	cat $+ >$@

manifolds.min.js: manifolds.js
	uglifyjs -o $@ $<

vendor/three.min.js:
	curl https://cdnjs.cloudflare.com/ajax/libs/three.js/r80/three.min.js >$@
