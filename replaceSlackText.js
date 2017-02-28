#!/usr/bin/env node

const fs = require('fs')
const replace = require('replace-in-file')
const filenamePassed = process.argv.slice(2).toString()
const inputFile = fs.readFileSync(filenamePassed, "utf8")
console.log(filenamePassed)
const options = {
 
  //Single file 
  files: filenamePassed,
 
  //Replacement to make (string or regex) 
  from: /foo/g,
  to: 'bar',
 
  //Multiple replacements with the same string (replaced sequentially) 
  //from: [/foo/g, /baz/g],
  //to: 'bar',
 
  //Multiple replacements with different strings (replaced sequentially) 
  //from: [/foo/g, /baz/g],
  //to: ['bar', 'bax'],
 
  //Specify if empty/invalid file paths are allowed (defaults to false) 
  //If set to true these paths will fail silently and no error will be thrown. 
  allowEmptyPaths: false,
 
  //Character encoding for reading/writing files (defaults to utf-8) 
  encoding: 'utf8',
}

try {
  let changedFiles = replace.sync(options);
  console.log('Modified files:', changedFiles.join(', '));
}
catch (error) {
  console.error('Error occurred:', error);
}


