#!/usr/bin/env node

const fs = require('fs')
const replace = require('replace-in-file')
const filenamePassed = process.argv.slice(2).toString()
const inputFile = fs.readFileSync(filenamePassed, "utf8")

const names = {

  //close up peoples names where there's spaces and then a newline in between the name and what they say
  from:  [ /^Tony.*\n/gm, /^Keith.*\n/gm, /^Ari.*\n/gm, /^Steve.*\n/gm, /^konte.*\n/gm, /^Scott.*\n/gm], 
  to: [`tony: `, `keith: `, `ari: `, `steve: `, `yannis: `, `scott: `]
}

const myName = {
  //skype desktop doesn't print your own name, instead if prints just the time, skype web prints name, hence replace my name above
  from:  [ /^[0-9][0-9]:[0-9][0-9]\n/gm], 
  to: [`tony: `]
  //will match kwijibo (newline)I said some stuff and replace it with kwijibo: I said some stuff
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

transform(names)
transform(myName)
