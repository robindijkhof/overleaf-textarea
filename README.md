# About

Spellcheck in Overleaf is very basic. It is nothing compared to dedicated tools such as Grammarly. I used to copy and paste into Docs back and forward until recently. I created this chrome extension that copies the content of the file visible and the editor; filters the commands/keywords and pastes the plain text in a textarea (Right area). This textarea is displayed over the pdf preview. Extensions such as Grammarly can't check complex editors such as Overleaf, but only work in textareas. Changes made to the textarea, either by extensions such as Grammarly or yourself, are evaluated and changes are merged back to the editor.

![](plugin.gif)

# Donation
If this project saved you time, you can buy me a cup of coffee :)

[![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=6B3GESXVWUPAJ)


# Instructions
  - Install the plugin https://chrome.google.com/webstore/detail/overleaf-textarea/iejmieihafhhmjpoblelhbpdgchbckil
  - Activate the plugin by clicking the plugin en enabling the checkbox.
  - Click the textarea to initialize spellcheck.
  
Note: the only known limitation is that the number of lines while editing CANNOT change. Inserting Enters in the textarea breaks merging back changes to the editor.

# Privacy
This plugin does not collect any data.

# Custom filters
You can add custom filter to filter latex command I forgot about or simply do not support.
You have to enter a regex or string and a replace value. For regexes you need to escape characters like \ as you would do as usual.
For string there is no need to escape.

![](plugin.png)

This work mostly like the JavaScript `replaceAll` function. 
More on that here: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replaceAll


Examples:

| Regex or string           | replace value | Latex text               | Result text            |
| ------------------------- | ------------- | -------------------------|----------------------- |
| /(\\\\author{)(.*?)(})/g  |               | \\author{it is me}      |                        |
| /(\\\\author{)(.*?)(})/g  | $2            | \\author{it is me}      | it is me               |
| \\_                       | _             | This is an\\_underscore  | This is an_underscore  |
| a                         | b             | Example                  | Exbmple                |




# TODO
  - Adding more filters.
  - Allow custom filter.
