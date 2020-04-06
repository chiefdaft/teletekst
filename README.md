# teletekst
 
This is a NodeJS/Express based webpage that generates a text view of a Teletekst page, including a few controls to select a page and subpage. The data is extracted from a JSON file from https://nos.nl/teletekst webpage.
The result can be viewed at https://teletekst-display.herokuapp.com/tt.

To debug and find new character hashes use the testimg.js or testgif.js javascript file an pipe the output to a etx file. 
In the testimg.js alter the url with the teletext page image (a png-file in this case)
For example, execute the following command on the commandline:
nodejs testimg > unknownhash.txt
All known characters will be ignored, the unknown ones will be exported into the text file with their posititon and hash. On the position the unknown character was found a = sign fill be put in the teletext text.
