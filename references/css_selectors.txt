| CSS Selector            | HTML Attribute or Element    |
|-------------------------|------------------------------|
| .class1                 | class="class1"               |
| .class1.class2          | class="class1 class2"        |
| .class1 .class2         | class="class1" (descendant of class="class2") |
| #id                     | id="id"                      |
| *                       | All elements                 |
| element                 | <element>                    |
| element.class           | <element class="class">      |
| div, p                  | <div> and/or <p>             |
| div p                   | All <p> inside <div>s        |
| div > p                 | All <p> directly inside <div>s |
| div + p                 | The first <p> directly inside <div>s |
| element1~element2       | All element2s preceded by element1 |
| [target]                | target=""                    |
| [target="_blank"]      | target="_blank"              |
| [title~="flower"]       | title="the-flower-maker"     |
| [lang|="en"]            | lang="english"               |
| a[href^="https"]       | <a href="https://gg">        |
| :active                 | a:active                     |
| ::after                 | p::after                     |
| ::before                | p::before                    |
| :checked                | input:checked                |
| :default                | input:default                |
| :disabled               | input:disabled               |
| :empty                  | p:empty                      |
| :enabled                | input:enabled                |
| :first-child            | p:first-child                |
| ::first-letter          | p::first-letter              |
| ::first-line            | p::first-line                |
| :first-of-type          | p:first-of-type              |
| :focus                  | input:focus                  |
| :fullscreen             | :fullscreen                  |
| :hover                  | a:hover                      |
| :in-range               | input:in-range               |
| :indeterminate          | input:indeterminate          |
| :invalid                | input:invalid                |
| :lang(language)         | p:lang(it)                   |
| :last-child             | p:last-child                 |
| :last-of-type           | p:last-of-type               |
| :link                   | a:link                       |
| ::marker                | ::marker                     |
| :not(selector)          | :not(p)                      |
| :nth-child(n)           | p:nth-child(2)               |
| :nth-last-child(n)      | p:nth-last-child(2)          |
| :nth-last-of-type(n)    | p:nth-last-of-type(2)        |
| :nth-of-type(n)         | p:nth-of-type(2)             |
| :only-of-type           | p:only-of-type               |
| :only-child             | p:only-child                 |
| :optional               | input:optional               |
| :out-of-range           | input:out-of-range           |
| ::placeholder           | input::placeholder           |
| :read-only              | input:read-only              |
| :read-write             | input:read-write             |
| :required               | input:required               |
| :root                   | :root                        |
| ::selection             | ::selection                  |
| :target                 | #news:target                 |
| :valid                  | input:valid                  |
| :visited                | a:visited                    |

[Source](https://www.w3schools.com/cssref/css_selectors.php)
