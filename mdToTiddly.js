#!/usr/bin/env node

const fs = require('fs')
const replace = require('replace-in-file')
const filenamePassed = process.argv.slice(2).toString()
const inputFile = fs.readFileSync(filenamePassed, "utf8")


const headings = {

 //pad out any codeblocks so we need to insert a newline before and after whenever we see three backticks (to account for it being opening or closing backticks) 
  from: /(?<!\w)#/gm,
  to: `!`  
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
