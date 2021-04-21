#!/usr/bin/env node

const fs = require('fs')
const replace = require('replace-in-file')
const filenamePassed = process.argv.slice(2).toString()
const inputFile = fs.readFileSync(filenamePassed, "utf8")


const headings = {
  //todo: real way to match unicode characters
  from: /(?<!\w)!/gm,
  to: `#`  
}

const images = {
  //$1 will be e.g.: width which either we throw away or we go to html - https://gist.github.com/uupaa/f77d2bcf4dc7a294d109
  //$2 optional image name (don't tend to use in tiddly, do tend to in gfm
  //$3 the image (remember in GFM we'll need to put our image in 'diagrams' folder in the wiki repo or similar
  from: /^\[img(.*)\[(.*\|)?(.*)\]\]/gm,
  to: `!\[$2\]\($3\)`
}

const boldStars = {
  // markdown is **this** or __this__, tiddly is ''this''
  // ? enables >1 occurance of boldstars on the same line being treated as one - https://javascript.info/regexp-greedy-and-lazy
  from: /''(.*?)''/gm,
  to: `**$1**`
}


const transform = (options) => {
  //we're going to merge this files property into the options object to DRY it
  const file = { files: filenamePassed }

  try {
    let changedFiles = replace.sync(Object.assign(options, file))
    console.log(`replaced content in ${options.files}` )
  }
  catch (error) {
    console.error(`Error occurred:`, error)
  }

}

transform(headings)
transform(images)
transform(boldStars)
