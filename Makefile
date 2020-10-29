TS := $(wildcard src/*.ts)
JS := $(TS:.ts=.js)

ifdef YARN_WRAP_OUTPUT
	# We were invoked from Yarn.
	TSC := tsc
else
	TSC := yarn tsc
endif

$(JS) &: $(TS) package.json tsconfig.json yarn.lock
	$(TSC)

clean :
	rm -f src/*.js

.PHONY : clean
