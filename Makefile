REPORTER = dot

clean:
		rm -rf lib-cov

test:
	@./node_modules/.bin/mocha ./test --reporter $(REPORTER)

test-cov: generate-cov
		@JSCOV=1 $(MAKE) test REPORTER=json-cov

generate-cov:
		@rm -rf lib-cov
		@jscoverage lib lib-cov

.PHONY: test