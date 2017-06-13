! This evolved from the following note I made

!! Regex to replace slack or skype grammar in vim

!!!You need a colon : before all of these
first get rid of the time which will be in the format `[00:00]`

```
%s/\[[0-9]*:[0-9]*.*]//g
```

then close up peoples names where there's spaces and then a newline in between the name and what they say:

```
%s/^\(kwijibo\|tony\|sfaulmann\|ari\|konte\.yiannis\).*\n/\1:/g
```
will match `kwijibo    `(newline)`I said some stuff`
and replace it with
`kwijibo: I said some stuff`

then get rid of any instance of the word '(edited)'

```
%s/(edited)//g
```

then get rid of lines that just say `new messages`

```
%s/^new messages$//g
```

similarly sometimes we seem to get a date header of today, remove it
(actually we get date headers too like ---- January 4th ---- so really you need to look for ^---- {today|jan|feb|mar|apr|may} .* ---$

```
%s/^----- Today.*$//g

```

then close up lines that look blank but in fact contain white spaces (tiddly hates 'em)

```
%s/^ *$//g
```

then we could close up all blank lines with this, but tiddly needs them. Instead we should close up anything with >1 blank lines, and replace it with just one blank line

```
g/^$*\n^$/d
```
see http://stackoverflow.com/a/706083/3536094. 

>:g will execute a command on lines which match a regex. The regex is 'blank line' and the command is :d (delete). 

I chanced upon this: why does it replace with one blank? I don't know. What does g do? I don't know. etc

then pad out any codeblocks so we need to insert a newline before and after whenever we see three backticks (to account for it being opening or closing backticks). Important to do this after the previous step since we are inserting blank lines (or actually now I think we shoulddo it before as we'll always ensure there's one blank line?!?!). Now here we need to know the difference between n and r (if you use \n in replace position itll give you a (red) null byte
http://stackoverflow.com/a/12388814/3536094

> In the syntax s/foo/bar \r and \n have different meanings, depending on context.
>For foo: \n = newline, \r = CR (carriage return = Ctrl-M = ^M)
>For bar: \r = is newline, \n = null byte (0x00).

```
%s/\s*```/\r```\r/g
```
(the /s* gets rid of a trailing space that slack seems to love)

Now we have to pick out places where special characters like `<` have been put in unquoted. That's why your lines will look wrong....

