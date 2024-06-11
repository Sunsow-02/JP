//Author: Vincent Siu
//Filename: ParseWordBank.js
//Description: Contains the script to parse comma/line delimited txt files and print to console/insert into a database
//Last Update: finished documentation
//let word_bank_file = null;

//import HashTable from "./WordBank.js"

//Note on regex:
//\r \s is whitespace, which is fine as long they are on the sides of a word
//upper/lower case words are accepted, but will all be converted to lowercase prior to hashtable insertion
//conversion will happen via toLowerCase()

//parse a comma delimited text file and insert words into the hashtable
//then assign the hashtable to a filescope variable

function ParseCommaDelim() 
{
    var reader = new FileReader();
    reader.readAsText(this.files[0]);
    reader.onload = function() 
    {
        let hash = new HashTable();
        let pattern = /^[\r]?[\s]?[a-zA-Z]*[\s]?[\r]?$/;
        //space on either end of the word is fine, same as return char for end of word
        let rowData = this.result.split(',');
        for(var index = 0; index < rowData.length; index++)
        {
            let result = pattern.exec(rowData[index])
            if(result)
            {
                //trim() removes any whitespace on either end of the string
                rowData[index] = rowData[index].trim();
                rowData[index] = rowData[index].toUpperCase();
                hash.insert(rowData[index])
            }
        }
        document.getElementById("word_bank_file").value = hash;
        alert("Comma Delimited File Loaded Successfully")
    };
    
    // re-attach listener
    document.getElementById('commaDelim').addEventListener('change', ParseCommaDelim, false);
}

//parse a line delimited text file and insert valid words (determined by the regex) to a local var hashtable
//then assign the hashtable to a filescope variable
function ParseLineDelim() 
{
    var reader = new FileReader();
    reader.readAsText(this.files[0]);
    reader.onload = function() 
    {
        let hash = new HashTable();
        let pattern = /^[\s]?[a-zA-Z]*[\s]?[\r]?$/;
        //ignore whitespace to the left/right of the word
        let rowData = this.result.split('\n');
        for(var index = 0; index < rowData.length; index++)
        {
            let result = pattern.exec(rowData[index])
            if(result)
            {
                //trim() removes whitespace from the left/right side of the string
                rowData[index] = rowData[index].trim();
                rowData[index] = rowData[index].toUpperCase();
                hash.insert(rowData[index])
            }
        }
        document.getElementById("word_bank_file").value = hash;
        alert("Line Delimited File Loaded Successfully")
    };
    
    // re-attach listener
    document.getElementById('lineDelim').addEventListener('change', ParseLineDelim, false);
}

//when the script gets first loaded by grid.html attach listeners to the functions the 2 load wordbank buttons
//are linked to
document.getElementById('lineDelim').addEventListener('change', ParseLineDelim, false);
document.getElementById('commaDelim').addEventListener('change', ParseCommaDelim, false);