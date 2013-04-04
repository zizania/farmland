var d3 = require('d3')
  , Tip = require('tip')

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
  .attr('id', function (c) { return 'tree' + c.id })
  .on('click', function (c) {
    if (c.tip) {
      c.tip.remove()
      delete c.tip
    }
    else {
      c.tip = (new Tip('tree ' + c.id)).position('south').show(this)
    }
  })

var treeRadiusScale = d3.scale.linear()

treeRadiusScale
  .domain([projection.scale(), projection.scale() * 10])
  .range([5, 30])

redraw()

function redraw() {
  var scale, translate

  if (d3.event) {
    scale = d3.event.scale
    translate = d3.event.translate
  }
  else {
    scale = projection.scale()
    translate = projection.translate()
  }

  if (d3.event) {
    projection
      .translate(translate)
      .scale(scale)
  }

  // force re-projection
  group.selectAll('path').attr('d', path)

  var trees = group.selectAll('.tree')

  trees
    .attr('cx', function (c) { return projection(c.coordinates)[0] })
    .attr('cy', function (c) { return projection(c.coordinates)[1] })
    .attr('r', treeRadiusScale(scale))
    .each(function (c) {
      c.tip && c.tip.reposition()
    })
}
