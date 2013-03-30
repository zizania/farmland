#!/usr/bin/env node

var cheerio = require('cheerio')
  , fs = require('fs')

var program = require('commander')

program
  .option('-r,--resource <resource>', 'Resource to convert. Either trees or outline')
  .parse(process.argv)

var filePath = __dirname + '/../resources'

if (!program.resource) {
  console.error('no resource option specified')
  process.exit()
}

if (program.resource === 'trees') {
  filePath += '/trees.kml'
}
else if (program.resource === 'outline') {
  filePath += '/outline.kml'
}
else {
  console.error('resource "' + program.resource + '" not known')
  process.exit()
}

// read file
var xml = fs.readFileSync(filePath)

// opts to pass to html2parser
var parseOpts = {
  xmlMode: true,
  lowerCaseTags: true
}

var $ = cheerio.load(xml, parseOpts)

if (program.resource === 'trees') {
  var placemarks = $('placemark')

  // in the kml, the coordinates are stored like this
  // <coordinates>25.07605527359619,35.30478658234575,0</coordinates>
  //
  // so this regex captures the longitude and latitude
  var coordsRegex = /^([0-9\.]+),([0-9\.]+)/

  // this is silly jquery-like map, passes index first
  var data = placemarks.map(function (i, marker) {
    // get the data inside the coordinates element of the xml
    // and get the matches
    var coords = $(marker).find('coordinates').html()
      , match = coords.match(coordsRegex)

    // if it didnt match, then fail
    if (coords === null) {
      throw new Error('coords regex failed for "' + coords + '"')
    }

    var lon = match[1]
      , lat = match[2]

    // format used in our d3 code. so that the output is copy-paste-able
    return {
      id: i.toString(),
      coordinates: [lon, lat]
    }
  })

  console.log(JSON.stringify(data))
}
else if (program.resource === 'outline') {
  var coordinates = $('coordinates').html()

  var coordsRegex = /([0-9\.]+),([0-9\.]+)/g

  var match

  var data = []

  while ((match = coordsRegex.exec(coordinates)) != null) {
    data.push([match[1], match[2]])
  }

  data.push(data[0])

  console.log(JSON.stringify(data))
}
