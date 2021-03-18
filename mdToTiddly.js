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

const codeBlocksStartLate = {
  // markdown doesn't care, tiddly needs code blocks to start at bol
  from: /^ *```/gm,
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
  /* url links are like [title](link) in markdown and [[title|link]] in tiddly
   *
   * from: / \[(.*)\]\((.*)\)/gm,
   * to: ` [[$1|$2]]`
   * but change the latter capturing group to [^)], else the last matching ) is
   * non-greedy and includes everything after a url in a line if that line had "url then (some
   * comment in brackets)"
   * from: / \[(.*)\]\(([^)]*)\)/gm,
   * but if we don't look for 'not ]' inside the first capturing group, any lines with two links
   * will be processed as one link
   * from: / \[([^\]]*)\]\(([^)]*)\)/gm,
   * then there's a problem with urls that have a | in them: | in the name section will corrupt
   * wikitext links (coz there will be two |) without altering again they'll come out like this:
   * source: [Node v12.12.0 (Current) \| Node.js](https://nodejs.org/en/blog/release/v12.12.0/)
   * dest: [[Node v12.12.0 (Current) \| Node.js|https://nodejs.org/en/blog/release/v12.12.0/]]
   * what we need to do is say that the website description might contain an optional |, and if
   * its found, don't print it in the output. Firstly here's how it looks if we just lose anything
   * including and past the first | in the name section (lets simplify things for a mo and pretend the
   * text we lose can be anything and not 'not ]')
   * from: / \[([^|\]]*)\|?.*\]\(([^)]*)\)/gm,
   * but instead, keep anything after that first | (its like stripping out the first | - which this
   * domain is somewhat bad at), sadly we DO need to search for 'not ]' again in the second capturing group,
   * else we get out twolinks-as-one-link problem back
   * from: / \[([^|\]]*)\|?([^\]]*)\]\(([^)]*)\)/gm,
   * to: ` [[$1$2|$3]]`
   * then, that initial space might not always be true, the url might start the line, its
   *  whitespace, and we need to capture and preserve it coz it might be various types of space */
  from: /(\s+)\[([^|\]]*)\|?([^\]]*)\]\(([^)]*)\)/gm,
  to: `$1[[$2$3|$4]]`
   //despite all this i still found a failiure: when the source has [solved] as the first 3 words - md
  //syntax is so much better here....
}

const backticks = {
  // markdown if forgiving of backticks having leading/trainling whitespace, tiddly not so
  from: /^ *``` */gm,
  to: `\`\`\``
}

const headings = {
  // heading are # in md, ! in tiddly. annoyingly # is numbered list in tiddly!
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

const doneTasks = {
  // to mildly improve todos marked as done, we can mimic markdown rendering and render the whole line as strikethough, we could just /^- \[(x)\] (.*)/gm as the from, but we try to mitigate a problem with unbalanced strikethroughs, as it did come up,so we capture and throw away a potential begin strikethrough
  from: /^- \[(x)\] (~~)*(.*)/gm,
  to: `- [$1] ~~$3~~`
}
/*
 * some other changes suggested by looking at https://github.com/holdenlee/TwToMd/blob/master/TwToMd.hs
 * italics, quote, escape, list, links and wikilinks
 *
 * some other changes that came up in use:
 *  * I had a syntax error when using apostrophe for possession, i''m - markdown has no such syntax, tiddly will bold and concat linebreaks on all following text, so is it safest to remove any found?
 *  * wikitext needs linespaces between text to render text on seperate lines, md does not, I could try and detect some needs for linepsaces, for instance I had lots of links, one per line, in md: 
 * [5 Best Software Programs to Manage Dual Monitors](https://helpdeskgeek.com/free-tools-review/best-dual-monitor-software/)
 * [Download the best dual-monitor software for Windows](https://windowsreport.com/dual-monitor-software/2/)
 * [5 Best Multi Monitor Software - Appuals.com](https://appuals.com/5-best-multi-monitor-software/)
 * [How do you manage switching quickly between 3 monitor gaming and normal use? : nvidia](https://www.reddit.com/r/nvidia/comments/7j29y2/how_do_you_manage_switching_quickly_between_3/)
 *
 * and they get converted in wikitext to this, but without linepsaces in between each entry (or without being surrounded by """), will print on a single line :
 *
 * [[5 Best Software Programs to Manage Dual Monitors|https://helpdeskgeek.com/free-tools-review/best-dual-monitor-software/]]
 * [[Download the best dual-monitor software for Windows|https://windowsreport.com/dual-monitor-software/2/]]
 * [[5 Best Multi Monitor Software - Appuals.com|https://appuals.com/5-best-multi-monitor-software/]]
 * [[How do you manage switching quickly between 3 monitor gaming and normal use? : nvidia|https://www.reddit.com/r/nvidia/comments/7j29y2/how_do_you_manage_switching_quickly_between_3/]]
 *
 * * Similarly a numbered list might print on a single line if the line above it is populated, if the beginning of a list or a monospace block (and prob lots of other constructs) are detected, the line above it needs to be blank
 * e.g.:
 * this should be a blank line
 * 1) first item
 * 2) second item
 *
 * * markdown in boostnote is more forgiving of starting a strikethrough with ~~ and not closing it with another ~~, it will contitnue strikethrough till it finds a blank link, tiddlywiki will continue strikethrough till the end of the tiddler, not really sure what the rule would be here though - look for balanced ~~ in the rest of the doc if you find a single instance perhaps (it might be a multiline strikethrough)?
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
transform(codeBlocksStartLate)
transform(taskLists)
transform(doneTasks)
transform(whitespaceLines)
transform(boldStars)
transform(boldUnderscores)
transform(images)
transform(urls)
transform(backticks)
transform(headings)
transform(numLists)
