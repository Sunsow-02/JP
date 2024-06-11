const letterValues = {
    A: 1, 
    B: 3, 
    C: 3,
    D: 2,
    E: 1,
    F: 4, 
    G: 2,
    H: 4,
    I: 1,
    J: 8,
    K: 5,
    L: 1,
    M: 3, 
    N: 1,
    O: 1,
    P: 3,
    Q: 10,
    R: 1,
    S: 1,
    T: 1,
    U: 1,
    V: 4,
    W: 4,
    X: 8,
    Y: 4,
    Z: 10
}

function setValue(letter, value)
{
    if(letterValues.hasOwnProperty(letter))
    {
        letterValues[letter] = value;
    }
    else
    {
        console.log("Error: Symbol not found");
        return 0;
    }
}

function getValue(letter)
{
    if(letterValues.hasOwnProperty(letter))
    {
        return letterValues[letter];
    }
    else
    {
        console.log("Error: Symbol not found");
        return 0;
    }
}

function addPointDisplay(tile)
{
    pointValue = getValue(tile.textContent);
    tile.innerHTML += '<br><span class="subtext">' + pointValue + "</span></br>";
}


/*********************
 * Function: GetTotal(word)
 * 
 * parameters:  word - a word string that is found on the board and in the dictionary
 * 
 * precondition: word is found on the board and is in the dictionary
 * 
 * postcondition: returns the point value for word based on point value of letters 
 *********************/
function GetTotal(word)
{
    let points = 0;
    for (let index = 0; index < word.length; index++) {        // loop through each char in word
        points += getValue(word[index]);
    }
    return points; // return the total points
}
