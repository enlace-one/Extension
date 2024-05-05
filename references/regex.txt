### Qualifers
| Item   | Description            | Example               |
|--------|------------------------|-----------------------|
| *      | Zero or more times     | f* matches '', 'f', 'ffff' |
| ?      | Once or None           | f? matches '', 'f'   |
| ?      | Once or None           | f? matches '', 'f'   |
| +      | One or more times      | f+ matches 'f', 'ffff'   |
| {3}    | 3 times                | f{3} matches 'fff'   |
| {2, 4} | 2, 3, or 4 times       | f{2, 4} matches 'ff', 'fff', 'ffff'   |
| {2,}   | 2 or more times        | f{2,} matches 'ff', 'fffff'   |

### Other
| Item   | Description            | Example               |
|--------|------------------------|-----------------------|
| $      | End of line            | f$ matches 'f', but not 'fb'   |
| ^      | Start of line          | ^f matches 'fb', but not 'bf'   |
| \n     | Newline                |                         |
| \      | Escape character       | \. matches '.', not any character   |
| []     | Any character in brackets | [ghf] matches 'g', 'h', 'f'   |
| [a-z]  | Any character in range| [a-c] matches 'a', 'b', 'c'   |
| [^a-z] | Not any character in range| [^a-c] matches 'z', not 'a'   |
| (?=...)| Positive lookahead     |                         |
| (?<=...)| Positive lookbehind   |                         |
| (?!...)| Negative lookahead     |                         |
| (?=...)| Negative lookbehind    |                         |

### Advanced Examples
| Pattern                      | Matches                  | Fails                |
|------------------------------|--------------------------|----------------------|
| ^(?(?!(\w)(\w)\2\1).)+$     | effusive                 | labba                |
| ^"[^"]+$                     | "effusive" OR "23:."     | 'effusive'           |
| (?                           | Tarzan                   | "Tarzan"             |
| ^(?!xx+)\1+$                | Matches prime numbers of 'x' | Non-prime counts |

[Source](https://www.rexegg.com/regex-quickstart.html)

### Basic:
```
. - Any character except newline
\w - Word character [a-zA-Z0-9_]
\W - Non-word character [^a-zA-Z0-9_]
\d - Digit [0-9]
\D - Non-digit [^0-9]
\s - Whitespace (spaces, tabs, line breaks)
\S - Non-whitespace
\b - Word boundary
\B - Non-word boundary
^ - Beginning of a line
$ - End of a line
[abc] - Any of the enclosed characters
[^abc] - Any character not enclosed
(abc|def) - abc or def
* - Preceding item 0+ times
+ - Preceding item 1+ times
? - Preceding item 0 or 1 time
{n} - Exactly n occurrences of preceding item
{n,} - n or more occurrences of preceding item
{n,m} - n to m occurrences of preceding item
\0 - Null character
\n - New line
\r - Carriage return
\t - Tab
\v - Vertical tab
\f - Form feed
\xxx - Character specified by an octal number (xxx)
\xdd - Character specified by a hexadecimal number (dd)
\cX - Control character
```
### Quantifiers:
```
*? - Preceding item 0+ times (non-greedy)
+? - Preceding item 1+ times (non-greedy)
?? - Preceding item 0 or 1 time (non-greedy)
{n}? - Exactly n occurrences of preceding item (non-greedy)
{n,}? - n or more occurrences of preceding item (non-greedy)
{n,m}? - n to m occurrences of preceding item (non-greedy)
```
### Assertions:
```
?= - Lookahead assertion
?! - Negative lookahead
?<= - Lookbehind assertion
?<! - Negative lookbehind
?> - Once-only Subexpression
?() - Condition [if then]
?()| - Condition [if then else]
?# - Comment
```
### Examples:
```
^(?:(?!(\w)(\w)\2\1).)+$ - effusive, not labba
^"[^"]+$ - Content in “”
(?<!"(?=Tarzan"))Tarzan - Tarzan, not “Tarzan”
^(?!(xx+)\1+$) - Find prime # of ‘x’
```

Source: https://www.rexegg.com/regex-quickstart.html