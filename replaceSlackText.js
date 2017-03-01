#!/usr/bin/env node

const fs = require('fs')
const replace = require('replace-in-file')
const filenamePassed = process.argv.slice(2).toString()
const inputFile = fs.readFileSync(filenamePassed, "utf8")

const deletions = {
 
  from: [
    //first get rid of the time which will be in the format [00:00]
    /[[0-9]*:[0-9]*.*]/g, 
    //then get rid of any instance of the word '(edited)'
    /\(edited\)/g,
  
    //then get rid of lines that just say new messages
    /^new messages$/g,

    //similarly sometimes we seem to get a date header of today, remove it 
    //(actually we get date headers too like -— January 4th -— so really you need to look for ^-— {today|jan|feb|mar|apr|may} .* —

    /^----- Today.*$/g,
  
    //then close up lines that look blank but in fact contain white spaces (tiddly hates 'em)
    /^ *$/g
  
  ],
  to: ``
}

const names = {

  //close up peoples names where there's spaces and then a newline in between the name and what they say
  from:  [ /^kwijibo.*\n/gm, /^tony.*\n/gm, /^ari.*\n/gm, /^sfaulmann.*\n/gm, /^konte\.yiannis.*\n/gm], 
  to: [`keith: `, `tony: `, `ari: `, `steve: `, `yannis: `]
  //will match kwijibo (newline)I said some stuff and replace it with kwijibo: I said some stuff
}
  
const backticks = {

 //pad out any codeblocks so we need to insert a newline before and after whenever we see three backticks (to account for it being opening or closing backticks) 
  from: /```/gm,
  to: `\n\n\`\`\`\n`  
}

const blanklines = {

  //we could close up all blank lines, but tiddly needs them. Instead close up anything with >1 blank lines, and replace it with just one blank line
  from: /(^\s*[\r\n]){2,}/gm,
  to: `\n`
  //(the /s* gets rid of a trailing space that slack seems to love)
}


//TODO we have to pick out places where special characters like < have been put in unquoted. That's why your lines will look wrong....
 
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

transform(deletions)
transform(names)
transform(backticks)
transform(blanklines)
