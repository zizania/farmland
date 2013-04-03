var d3 = require('d3')

var farmland = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    id: '01',
    properties: { name: 'Farmland' },
    geometry: {
      type: 'Polygon',
      coordinates: [
        require('./farmland-outline-geo')
      ]
    }
  }]
}

var width  = window.innerWidth - 50
  , height = window.innerHeight - 50

var projection = d3.geo.mercator()
  .center([25.077496, 35.304934])
  .scale(width * 5353)

projection.translate([width / 2, height / 2])

var svg = d3.select('body').append('svg')
  .attr('id', 'map')
  .attr('width', width)
  .attr('height', height)
  .call(d3.behavior.zoom()
      .translate(projection.translate())
      .scale(projection.scale())
      .on("zoom", redraw))

svg.append('rect')
  .attr('width', width)
  .attr('height', height)
  .attr('opacity', '0')

var path = d3.geo.path().projection(projection)


var group = svg.append('g')
  .attr('id', 'farmland')


group.append('path')
  .attr('id', 'farmland-path')
  .datum(farmland)
  .attr('d', path)

var trees = require('./trees-geo')


var treesGroup = group.append('g').attr('id', 'trees-group')

treesGroup
  .selectAll('circle').data(trees)
  .enter().append('circle')
  .attr('class', 'tree')
  .attr('id', function (c) { return c.id })
  .attr('r', 5)

redraw()

function redraw() {
  if (d3.event) {
    projection
      .translate(d3.event.translate)
      .scale(d3.event.scale)
  }

  // force re-projection
  group.selectAll('path').attr('d', path)

  var trees = group.selectAll('.tree')

  trees
    .attr('cx', function (c) { return projection(c.coordinates)[0] })
    .attr('cy', function (c) { return projection(c.coordinates)[1] })
}
