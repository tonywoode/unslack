#!/usr/bin/env node

const replace = require('replace-in-file')
const filenamePassed = process.argv.slice(2).toString()

const bareForwardSlashed = {
  // tiddly corrupts all text after any //words - it sees them as italic openers that need closing
  // problem is: if they're in a code block, which is likely, they're fine
}

const unescapedMarkup = {
  // another manual thing: boostnote for instance often is forgiving, tiddly not so, of closing marks
}

const overEscapedCodeBlockMarkers = {
  // boostnote is forgiving of, and complicit in, doing `````` when you mean ```. tiddly is unforgiving
  from: /``````/gm,
  to: `\`\`\``
}

const whitespaceLines = {
  // markdown doesn't mind, but tiddly's parser can get very upset with these
  from: /^ *$/gm,
  to: ``
}

const images = {
  // images in markdown are ![name](uri), in tiddly [img[tooltip|uri]]
  from: /!\[(.*)\]\((.*)\)/gm,
  to: `[img[$1|$2]]`
}
const urls = {
  // url links are like [title](link) in markdown and [[title|link]] in tiddly
  /* note the [^)] in the latter capturing group, this was .* but then the last matching ) was being
   * non-greedy and including everything after a url in a line if that line had url then (some i
   * comment in brackets) */
  from: /[^!]\[(.*)\]\(([^)]*)\)/gm,
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

const numLists = {
  // these are 1. or even 1) in github markdown and annoyingly # in tiddly
  from: /^[0-9*][.)]/gm,
  to: `#`
}

const boldStars = {
  // markdown is **this** or __this__, tiddly is ''this''
  // backslash escaping needed for kleene stars, and also in js otherwise its a block comment!
  from: /\*\*(.*)\*\*/gm,
  to: `''$1''`
}

const boldUnderscores = {
  // markdown is **this** or __this__, tiddly is ''this''
  from: /__(.*)__/gm,
  to: `'$1'`
}

const taskLists = {
  // mardown has great checklists, tiddlies todos are horrific, the best we can do is pad md checklists
  from: /^- \[(x| )\]/gm,
  to: `\n- [$1]`
}
/*
 * some other changes suggested by looking at https://github.com/holdenlee/TwToMd/blob/master/TwToMd.hs
 * italics, quote, escape, list, links and wikilinks
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

transform(overEscapedCodeBlockMarkers)
transform(taskLists)
transform(whitespaceLines)
transform(boldStars)
transform(boldUnderscores)
transform(images)
transform(urls)
transform(backticks)
transform(headings)
transform(numLists)
