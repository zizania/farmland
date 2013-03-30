#!/usr/bin/env node

var cheerio = require('cheerio')
  , fs = require('fs')

// default to trees.kml, or grab from argv[2]
var filePath = process.argv[2] || __dirname + '/../resources/trees.kml'

// read file
var xml = fs.readFileSync(filePath).toString()

// opts to pass to html2parser
var parseOpts = {
  xmlMode: true,
  lowerCaseTags: true
}

var $ = cheerio.load(xml, parseOpts)
  , placemarks = $('placemark')

// in the kml, the coordinates are stored like this
// <coordinates>25.07605527359619,35.30478658234575,0</coordinates>
//
// so this regex captures the longitude and latitude
var coordsRegex = /^([0-9\.]+),([0-9\.]+)/

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
