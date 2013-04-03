
build: components index.js farmland.css
	component build -n farmland

components: component.json
	component install

clean:
	rm -fr build components

.PHONY: clean
