#!/usr/bin/env node

const replace = require('replace-in-file')
const filenamePassed = process.argv.slice(2).toString()

const urls = {
  // url links are like [title](link) in markdown and [[title|link]] in tiddly
  from: /\[(.*)\]\((.*)\)/gm,
  to: `[[$1|$2]]`
}

const backticks = {
  // markdown if forgiving of backticks haveing leading/trainling whitespace, tiddly not so
  from: /^ *``` */gm,
  to: `\`\`\``
}

const headings = {
  // heading are #* in md, ! in tiddly. annoyingly # is numbered list in tiddly!
  from: /(?<!\w)#/gm,
  to: `!`
}

/*
 * some other changes suggested by looking at https://github.com/holdenlee/TwToMd/blob/master/TwToMd.hs
 * italics, bold, quote, escape, list, links and wikilinks, images
 */ 


const transform = options => {
  // we're going to merge this files property into the options object to DRY it
  const file = { files: filenamePassed }

  try {
    let changedFiles = replace.sync(Object.assign(options, file))
    console.log(`replaced content in ${options.files}`)
  } catch (error) {
    console.error(`Error occurred:`, error)
  }
}

transform(urls)
transform(backticks)
transform(headings)
