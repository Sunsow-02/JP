const QUERYRES = document.getElementById('queryresult')

async function returnqueryresult(word) {
    //console.log('we got into querysearch')
    const QueryResult = await fetch(`http://localhost:7000/results?search=${word}`)
        .then(response => {/*console.log('we got into the .then');*/ return response.json().then((data) => {return data})})
        .catch(err => console.log(err))

    console.log(QueryResult); //this will show the result in the front end console
    
    return QueryResult;
}

/**********************************************************************************************
*   Function: EndTurn
*
*   Purpose: handle someone ending their turn by calculating damage and healing that will be applied before changing
*
*   Parameters: grid - container object that holds our current data
*
*   Precondition: none
*
*   Postcondition: if a word is not in the dictionary, show that word in red and don't end their turn
                   if all words are in the dictionary, calculate their damage and healing
                   if in those words there are freeze effects, give it to chosen player
                   returns an array with damage in position 0, healing in position 1, and an array of players to freeze in position 2. 
                   
                   TODO: position 2 (players to freeze) not implemented yet
                         checking for an island word (not connected to a previously played word) not implemented
**********************************************************************************************/
async function EndTurn(grid) {
    if(grid.CheckCont()){
        var wordIndexes = grid.getNewStrings();
        if(wordIndexes == null) //if there are no new strings
            return false; //TODO come up with specific error handling for scenario (maybe try catch or something)
        var words = ConvertIndexesToStrings(wordIndexes, grid);
        var pass = true;
        var word_bank_file = grid.word_bank_file;
        
    
        if (grid.word_bank_option == 1) {
             for(let i = 0; i < words.length; ++i) {
                if(!word_bank_file.search(words[i])) {
                    grid.MarkWordInvalid(wordIndexes[i]);
                    pass = false;
                }
            }
        } else {
            for(let i = 0; i < words.length; ++i) {
                if((await returnqueryresult(words[i]) == false)) {
                    grid.MarkWordInvalid(wordIndexes[i]);
                    pass = false;
                }
                
            }
        }
    
        //all words are valid 
        if(pass == true && words.length > 0) {
            var healthChangeArr = []; // 0 = Damage, 1 = Heal
            var value; 
            var freezeFlag = false;
            var shuffleFlag = false;
            healthChangeArr[0] = 0;
            healthChangeArr[1] = 0;
            healthChangeArr[2] = 0;
            //TODO: could have 1 variable and set/mask the bits
            for (let i = 0; i < words.length; ++i) {
                value = HandleWord(words[i], wordIndexes[i], grid);
                ChangeAllNewLetterStates(wordIndexes[i], grid);
                if (value < 0) {
                    healthChangeArr[1] += value[0];
                }
                else {
                    healthChangeArr[0] += value[0];
                }

                if (value[1] == 1) {
                    freezeFlag = true;
                }

                if (value[2] == 1) {
                    shuffleFlag = true;
                }

            }
                //console.log(freezeFlag);
                if (freezeFlag) {
                    healthChangeArr[2] = true;
                }
                if(shuffleFlag) {
                    const tile = new YellowTile('x','', true);
                    tile.CalculateEffect(grid);
                    healthChangeArr[3] = true;
                }
                healthChangeArr[2] = freezeFlag;
                healthChangeArr[3] = shuffleFlag
    
            console.log("Damage: %d",healthChangeArr[0]); //for demonstration purposes.
            console.log("Heal: %d", healthChangeArr[1]);
            return healthChangeArr;
        }
    } 
    else {
        grid.MarkWordInvalid(grid.GetNewLetters());
    }
        return [];
}

//returns an array with [0] = point value (after processing for effect tiles) [1] = 1 if blue tile effect happened
function HandleWord(word, positionArray, grid) {
    var value = [];
    value[0] = GetTotal(word);
    for (let i = 0; i < positionArray.length; ++i) {
        const tilePosition = grid.array[positionArray[i]];
        //console.log(grid.array[positionArray[i]]);
        if (tilePosition.IsNew == true) { //only calculate effect if the tile is a new one, don't want them playing all the time.
            //did if else because instanceof doesn't work with switch (that i found).
            if (tilePosition instanceof RedTile) { //if it's a red
                //console.log('we hit a red');
                value[0] = tilePosition.CalculateEffect(value[0]);
            }
            else if (tilePosition instanceof GreenTile) {
                //console.log('we hit a green');
                value[0] = tilePosition.CalculateEffect(value[0]);
            }
            else if (tilePosition instanceof BlueTile) { //this one needs to be changed because we don't want to freeze local hand, we want to freeze chosen hand.
                //tilePosition.CalculateEffect(hand);
                //console.log('we hit a blue');
                value[1] = 1; //set flag for freezing
            }
            else if (tilePosition instanceof YellowTile) {
                //console.log('we hit a yellow');
                //tilePosition.CalculateEffect(grid);
                value[2] = 1; //set flag for randomizing board (we can also make it randomize on the word but future word calculation during same turn would be messed up)
            }
            else if (tilePosition instanceof WildTile) {
                const { flag, result} = tilePosition.CalculateEffect(grid, value);
                switch(flag){
                    case "red":
                        value[0] = result;
                        break;
                    case "green":
                        value[0] = result;
                        break;
                    case "blue":
                        value[1] = 1;
                        break;
                    case "yellow":
                        value[2] = 1;
                        break;
                    default:
                        //Open to additional effects
                }
            }
        }
    }
    return value;
}

/**********************************************************************************************
*   Function: ConvertIndexesToString(wordIndexes, grid)
*
*   Purpose: Change an array of indexes into a string so that we can calculate point values & check validity of string
*
*   Parameters: grid - container object that holds our current data
*               wordIndexes - indexes of the words we are trying to change into different words (2d array with each row as a word)
*
*   Precondition: none
*
*   Postcondition: returns an array with all words in string form
**********************************************************************************************/
function ConvertIndexesToStrings(wordIndexes, grid) {
    var words = [];
    var tempWord = '';

    for(let i = 0; i < wordIndexes.length; ++i) {
        for(let j = 0; j < wordIndexes[i].length; ++j) {
            tempWord += grid.array[wordIndexes[i][j]].Contents;
        }
        words.push(tempWord);
        tempWord = '';
    }

    return words;
}

/**********************************************************************************************
*   Function: ChangeAllNewLetterStates(wordIndexes, grid)
*
*   Purpose: change the letter states of a given word on the board so that we know it's an old word rather than a new one
*
*   Parameters: grid - container object that holds our current data
*               wordIndexes - the indexes of the word we are trying to change the letter states of (from new to old)
*
*   Precondition: none
*
*   Postcondition: all tiles within the grid at proper array indexes have their isNew property set to false
**********************************************************************************************/
function ChangeAllNewLetterStates(wordIndexes, grid) {
    for(let i = 0; i < wordIndexes.length; ++i) {
        grid.array[wordIndexes[i]].IsNew = false;
        setInertId(grid.array[wordIndexes[i]].Id); //makes them not draggable nor droppable (don't want people moving old letters)
    }
}