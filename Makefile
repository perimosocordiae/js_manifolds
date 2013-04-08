
# Order matters!
JS_SRC = vendor/three.min.js \
         vendor/numeric-1.2.6.min.js \
         util.js \
         power_method.js \
         isomap.js \
         scatterplot.js \
         main.js

%.js: %.coffee
	coffee -c $<

.PHONY: dist dev clean
dev: $(JS_SRC)
dist: manifold.min.js
clean:
	rm -f *.js

manifolds.js: $(JS_SRC)
	cat $+ >$@

manifolds.min.js: manifolds.js
	uglifyjs -o $@ $<

