//import dbClass from '/database/Work.js';

/**********************************************************************************************
*   Function: setTheme(themeName)
*
*   Purpose: Change the theme of the board
*
*   Parameters: theme - Theme to change the board to
*
*   Precondition: Button calling setTheme is set to a theme
*
*   Postcondition: Theme changed
**********************************************************************************************/
function setTheme(themeName) {
    document.documentElement.className = themeName;
}

/**********************************************************************************************
* Class: Container
*
* Purpose: Create a manipulatable array.
*
*
* Data Members: height      - represents int value, holds the height of 2d array
*               width       - represents int value, holds the width of 2d array
*               containerId - represents string, holds value of the class id for DOM manipulation
*               array       - represents our array object, holds the tile class
*
*               ConnectionCondition - records Condition of connection
*               db                  - place holder for data base work
*               
*
* Member Functions: OpenConnection() opens connection to the database
*                   CloseConnection() close connection to the database
*                   VerifyQuery(String) receives a string and returns a bool on the existence of the string in the database
*                   CreateDivs() uses container_id to create the container's DOM
*                   MakeBoard() fills the array data member with tiles containing unique_id for DOM manipulation
*                   UpdateColor(id, color, styleChoice) update an individual tile using it's id to a new color
*                   UpdateMultiple() call updateColor() on a list of ids, instead of having to call the function many times
*                   getStrings() return list of strings greater than length 1 within container
*                   CheckCont() finds new instances of letters and returns 1 if they all follow a line and 0 if they are not the same 

**********************************************************************************************/
class Container {
    constructor(width, height, containerId, word_bank_option, word_bank_file) {
        this.height = height;
        this.width = width;
        this.containerId = containerId;
        this.effectCount = 35;
        this.word_bank_option = word_bank_option;
        this.word_bank_file = word_bank_file;
        this.array = [];
    }

    /**********************************************************************************************
     *   Function: MakeBoard(type)
     *
     *   Purpose: Create the board and allocate grid elements, then set the divs using CreateDivs()
     *
     *   Parameters: type - int to change board initialization:
     *                      0 == init grid for drop
     *                      1 == init grid for drag
     *                      else init grid for neither
     *
     *   Precondition: N/A
     *
     *   Postcondition: Allocates the tiles in array that hold internal data
     **********************************************************************************************/
    MakeBoard(type) {
        const width = this.width;
        const height = this.height;
        let gridItem = new BlankTile();
        let tempId = 0;
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                tempId = j + i * width;
                gridItem = new BlankTile(this.FormatId(tempId), '', true);
                this.array.push(gridItem);
            }
        }
        this.CreateDivs(type);
        if(this.containerId == 'entiregrid') {
            const origin = this.Origin();

            //this.array[origin].IsNew = false;
            document.getElementById(this.FormatId(origin)).style.backgroundColor = 'var(--originTile)';
        }
    }

    Origin() {
        var origin = Math.floor((this.width * this.height) / 2);

        if((this.width * this.height) % 2 == 0) {
            origin -= Math.ceil(this.width / 2);
        }

        return origin;
    }

    /**********************************************************************************************
     *   Function: CreateDivs(type)
     *
     *   Purpose: Set the div contents of each grid element innerHTML
     *
     *   Parameters: type - int to change board initialization:
     *                      0 == init grid for drop
     *                      1 == init grid for drag
     *                      else init grid for neither
     *
     *   Precondition: Each grid element has been allocated
     *
     *   Postcondition: Each grid element sets a class, id, and drag/drop properties if chosen
     **********************************************************************************************/
    CreateDivs(type) {
        let idStringTemp = ""; // Temporary string to hold the id of the grid element
        let divs = document.createElement("BOARD");
        const totalTileCount = this.width * this.height;

        // Loop through elements and set divs accordingly
        for (let i = 0; i < totalTileCount; ++i) {
            idStringTemp = '"' + this.FormatId(i) + '" ';
            let divElement = document.createElement("div");
            divElement.classList.add("internal");
            divElement.setAttribute("id", this.FormatId(i));
            divElement.setAttribute("draggable", type === 0);
            divElement.setAttribute("ondragstart", type === 0 ? "drag(event)" : "false");
            divElement.setAttribute("ondrop", type === 1 ? "drop(event)" : "false");
            divElement.setAttribute("ondragover", type === 1 ? "allowDrop(event)" : "false");
            divs.appendChild(divElement);
        }

        document.getElementById(this.containerId).innerHTML = divs.innerHTML;
    }

    /**********************************************************************************************
     *   Function: ClearBoard()
     *
     *   Purpose: Clears the board and resets it to blank
     *
     *   Parameters: N/A
     *
     *   Precondition: Container is created with set of ids to manipulate
     *
     *   Postcondition: containerId passed has all elements cleared
     **********************************************************************************************/
    ClearBoard() {
        let tempId = "";
        for (let i = 0; i < this.height * this.width; ++i) {
            tempId = this.FormatId(i);
            document.getElementById(tempId).innerHTML = "";
            document.getElementById(tempId).style.backgroundColor = "";
            document.getElementById(tempId).style.borderColor = "";
            setAllowDrop(document.getElementById(tempId));
            this.array[i] = new BlankTile(tempId);
        }

            document.getElementById(this.FormatId(this.Origin())).style.backgroundColor = 'var(--originTile)';
            //this.array[this.Origin()].IsNew = false;
    }

    /**********************************************************************************************
     *   Function: UpdateLetters()
     *
     *   Purpose: Update the letters on the board to reflect changes to the letter array
     *
     *   Parameters: N/A
     *
     *   Precondition: Container is created with set of ids to manipulate
     *
     *   Postcondition: Grid item reflects partner letter array
     **********************************************************************************************/
    UpdateLetters() {
        for (let index = 0; index < this.height * this.width; ++index) {
            const handTile = document.getElementById(this.FormatId(index));

            handTile.innerHTML = this.array[index].Contents;

            if (handTile.textContent != "") addPointDisplay(handTile);
        }
    }

    /**********************************************************************************************
     *   Function: FillHand()
     *
     *   Purpose: Populate player hand with new letter tiles when tile is empty/is missing letter tiles
     *
     *   Parameters: N/A
     *
     *   Precondition: Container is created with set of ids to manipulate
     *
     *   Postcondition: Player hand is populated with letter tiles
     **********************************************************************************************/
    FillHand() {
        // Define strings holding vowels, consonants, and the alphabet
        const vowels = "AEIOU";
        const consonants = "BCDFGHJKLMNPQRSTVWXYZ";
        const alphabet = vowels + consonants;

        const letterWeights = {
            A: 9,
            B: 2,
            C: 2,
            D: 4,
            E: 12,
            F: 2,
            G: 3,
            H: 2,
            I: 9,
            J: 1,
            K: 1,
            L: 4,
            M: 2,
            N: 6,
            O: 8,
            P: 2,
            Q: 1,
            R: 6,
            S: 4,
            T: 6,
            U: 4,
            V: 2,
            W: 2,
            X: 1,
            Y: 2,
            Z: 1,
        };

        // Initialize variables for the hand tiles and letters
        var handTile;
        var tempLetter;

        // Initialize vowel checking flag for guaranteed vowels
        // TODO: Config: add option to disable this, probably by calling this in a function that checks for classic or new tile rules (Limited tile count vs this)
        var vowelFlag = false;

        // Loop through hand to check for a vowel present, if so, a vowel will not be a guaranteed spawn
        for (let index = 0; index < this.width; ++index) {
            // Condense document get call to make it look prettier :)
            handTile = document.getElementById(this.FormatId(index));
            if (vowels.includes(handTile.textContent)) {
                vowelFlag = true;
                index = this.width;
            }
        }

        // Generate new letter tiles for the hand
        for (let index = 0; index < this.width; ++index) {
            handTile = document.getElementById(this.FormatId(index));
            if (handTile.textContent == "") {
                if (!vowelFlag) {
                    // If there are no vowels present, generate one and set the flag to false so multiple vowels are not guaranteed
                    tempLetter = this.WeightedRandomize(vowels, letterWeights);
                    vowelFlag = true;
                } else {
                    // Otherwise, just add a random letter based on weights
                    tempLetter = this.WeightedRandomize(alphabet, letterWeights);
                }
                // Set the tile's displayed letter and the array's value
                handTile.textContent = tempLetter;
                this.array[index].Contents = tempLetter;

                // Add the point display under the letter and make the tile draggable
                addPointDisplay(handTile);
                setAllowDrag(handTile);
            }
        }
    }

    /**********************************************************************************************
     *   Function: NewHand()
     *
     *   Purpose: Populate player hand with letter tiles
     *
     *   Parameters: N/A
     *
     *   Precondition: Container is created with set of ids to manipulate
     *
     *   Postcondition: Player hand is populated with letter tiles
     **********************************************************************************************/
    NewHand() {
        // Define strings holding vowels, consonants, and the alphabet
        const vowels = "AEIOU";
        const consonants = "BCDFGHJKLMNPQRSTVWXYZ";
        const alphabet = vowels + consonants;

        const letterWeights = {
            A: 9,
            B: 2,
            C: 2,
            D: 4,
            E: 12,
            F: 2,
            G: 3,
            H: 2,
            I: 9,
            J: 1,
            K: 1,
            L: 4,
            M: 2,
            N: 6,
            O: 8,
            P: 2,
            Q: 1,
            R: 6,
            S: 4,
            T: 6,
            U: 4,
            V: 2,
            W: 2,
            X: 1,
            Y: 2,
            Z: 1,
        };

        // Initialize variables for the hand tiles and letters
        var handTile;
        var tempLetter;

        // Initialize vowel checking flag for guaranteed vowels
        var vowelFlag = false;

        // Generate new letter tiles for the hand
        for (let index = 0; index < this.width; ++index) {
            handTile = document.getElementById(this.FormatId(index));
            if (!vowelFlag || index === 0) {
                // If there are no vowels present, generate one and set the flag to false so multiple vowels are not guaranteed
                tempLetter = this.WeightedRandomize(vowels, letterWeights);
                vowelFlag = true;
            } else {
                // Otherwise, just add a random letter based on weights
                tempLetter = this.WeightedRandomize(alphabet, letterWeights);
            }
            // Set the tile's displayed letter and the array's value
            handTile.textContent = tempLetter;
            this.array[index].Contents = tempLetter;

            // Add the point display under the letter and make the tile draggable
            addPointDisplay(handTile);
            setAllowDrag(handTile);
        }
    }

    /**********************************************************************************************
     *   Function: WeightedRandomize(characters, weights)
     *
     *   Purpose: Helper function to pick a letter based on the weights
     *
     *   Parameters: characters - letters to pick from
     *               weights - the weights for each letter
     *
     *   Precondition: N/A
     *
     *   Postcondition: Returns a random letter based on weights
     **********************************************************************************************/
    WeightedRandomize(characters, weights) {
        const weightedValues = [];
        for (const character of characters) {
            for (let i = 0; i < weights[character]; i++) {
                weightedValues.push(character);
            }
        }
        const randomIndex = Math.floor(Math.random() * weightedValues.length);
        return weightedValues[randomIndex];
    }

    /**********************************************************************************************
     *   Function: GenerateNewBoard()
     *
     *   Purpose: onClick function to reset the board before repopulating it with a new spread of effect tiles
     *
     *   Parameters: N/A
     *
     *   Precondition: Container is created with set of ids to manipulate
     *
     *   Postcondition: Board is cleared and has a new set of effect tiles
     **********************************************************************************************/
    GenerateNewBoard() {
        this.ClearBoard();
        const tileTypeOdds = {
            red: 0.3,
            blue: 0.3,
            green: 0.2,
            yellow: 0.1,
            purple: 0.1,
        };
        this.BoardRandomizer(tileTypeOdds);
    }

    /**********************************************************************************************
     *   Function: BoardRandomizer(tileTypeOdds)
     *
     *   Purpose: Randomly set the board tiles to different colors
     *
     *   Parameters: tileTypeOdds - Dictionary that holds an effect tile type and a percentage chance of appearing on the board
     *
     *   Precondition: Container is created with set of ids to manipulate
     *
     *   Postcondition: containerId passed and elements are changed to random colors
     **********************************************************************************************/
    BoardRandomizer(tileTypeOdds) {
        const boardSize = this.width * this.height;
        const tileTypes = [];
        const colorCounts = {}; // Track the number of tiles for each color
    
        // Initialize array to hold tile types and the chance of them appearing
        for (const [tileType, chance] of Object.entries(tileTypeOdds)) {
            const count = Math.floor(chance * boardSize);
            tileTypes.push(...Array(count).fill(tileType));
            colorCounts[tileType] = 0; // Initialize color count to 0
        }
    
        // Initialize empty set to hold special tile positions
        const effectPositions = new Set();
    
        // Generate unique random numbers for special tiles
        while (effectPositions.size < this.effectCount) {
            const effectPosition = this.Randomize(boardSize);
            if (effectPosition !== this.Origin())
                effectPositions.add(effectPosition);
        }
    
        // Add special tiles to the board
        for (const position of effectPositions) {
            // Choose a random effect tile type from tileTypes array
            const tileType = tileTypes[this.Randomize(tileTypes.length)];
            this.UpdateColor(position, tileType);
            colorCounts[tileType]++; // Increment the count for the chosen color
        }
    
        // Check if each color has at least one tile
        const colors = Object.keys(tileTypeOdds);
        for (const color of colors) {
            if (colorCounts[color] === 0) {
                // If a color is missing, find a random tile without an effect and replace it with the missing color
                let found = false;
                while (!found) {
                    const position = this.Randomize(boardSize);
                    if (effectPositions.has(position)) {
                        // Skip if the tile already has an effect
                        continue;
                    }
                    this.UpdateColor(position, color);
                    colorCounts[color]++;
                    found = true;
                }
            }
        }
    }

    /**********************************************************************************************
     *   Function: UpdateColor(id, color, styleChoice)
     *
     *   Purpose: Change the color of a tile
     *
     *   Parameters: id - int representing id of tile to be changed
     *               color - string representing color to change the tile to, defaults to default color
     *               styleChoice - int to decide how to color the tile, 0/default to color tile, 1 for tile border
     *
     *   Precondition: Element has an id and can be manipulate
     *
     *   Postcondition: Element has color changed
     **********************************************************************************************/
    UpdateColor(id, color, styleChoice) {
        var tileId = this.FormatId(id); //Format id used by get***ById functions

        //Switch statement to determine what color to change the tile to
        if (styleChoice !== 1) {
            switch (color) {
                case "blue":
                    this.array[id] = new BlueTile(tileId);
                    break;
                case "red":
                    this.array[id] = new RedTile(tileId);
                    break;
                case "green":
                    this.array[id] = new GreenTile(tileId);
                    break;
                case "yellow":
                    this.array[id] = new YellowTile(tileId);
                    break;
                case "purple":
                    this.array[id] = new WildTile(tileId);
                    break;
                default:
                    this.array[id] = new BlankTile(tileId);
            }
        }
        
        //Apply colors based off of .css colors to update along with theme change
        if (styleChoice === 1) {
            document.getElementById(tileId).style.borderColor = `var(--${color}Tile)`;
        } else {
            document.getElementById(tileId).style.backgroundColor = `var(--${color}Tile)`;
        }
    }

    /**********************************************************************************************
     *   Function: UpdateMultiple(idList, color, styleChoice)
     *
     *   Purpose: Change the color of multiple tiles at once
     *
     *   Parameters: idList - Array representing id of tiles to be changed
     *               color - string representing color to change the tiles to, defaults to default color
     *               styleChoice - int to decide how to color the tiles, 0/default to color tiles, 1 for tile borders
     *
     *   Precondition: Elements have an id and can be manipulated
     *
     *   Postcondition: Elements have colors changed
     **********************************************************************************************/
    UpdateMultiple(idList, color, styleChoice) {
        for (let i = 0; i < idList.length; ++i) {
            this.UpdateColor(idList[i], color, styleChoice);
        }
    }

    /**********************************************************************************************
     *   Function: MarkWordInvalid(idList) 
     *
     *   Purpose: Change the border of words that are invalid
     *
     *   Parameters: idList - Array representing id of tiles to be changed
     *
     *   Precondition: invalid word is played
     *
     *   Postcondition: Elements have borders changed to reflect invalidity
     **********************************************************************************************/
    MarkWordInvalid(idList) {
        for(let i = 0; i < idList.length; ++i) {
            document.getElementById(this.FormatId(idList[i])).style.borderColor = 'red';
        }
    }

    /**********************************************************************************************
     *   Function: UnmarkInvalidWords() 
     *
     *   Purpose: Change the border of words back to the default
     *
     *   Parameters: none
     *
     *   Precondition: container created
     *
     *   Postcondition: all grid elements have borders reset to reflect unknown validity (to be checked when they end turn again)
     **********************************************************************************************/
    UnmarkInvalidWords() {
        for(let i = 0; i < this.width * this.height; ++i) {
            document.getElementById(this.FormatId(i)).style.borderColor = null;
        }
    }
    

    /**********************************************************************************************
     *   Function: getAllStringIndexes()
     *
     *   Purpose: Searches grid array for strings of length > 1, horizontally and vertically
     *
     *   Parameters: N/A
     *
     *   Precondition: N/A
     *
     *   Postcondition: Returns array of strings greater than length 1 located on container
     **********************************************************************************************/
    getAllStringIndexes() {
        var strings = [];
        const width = this.width;
        const height = this.height;
        var tempWordIndexes = [];
        var makingStringFlag = false;
        var currentCharacter;
        var index;

        for (let i = 0; i < width; ++i) {
            for (let j = 0; j < height; ++j) {
                index = i * width + j;
                currentCharacter = this.array[index].Contents;
                if (currentCharacter != '') {
                    makingStringFlag = true; //set the flag to true
                    tempWordIndexes.push(index);
                } else {
                    //if current character is null

                    if (makingStringFlag) {
                        //if we are making a word
                        if (tempWordIndexes.length > 1) {
                            //if word greater than length 1
                            strings.push(tempWordIndexes); //push array of indexes into strings
                        }
                        tempWordIndexes = []; //reset tempWordIndexes
                        makingStringFlag = false;
                    }
                }
            }
            if (makingStringFlag) {
                //there was a word at end of row/column (to stop wrapping)
                if (tempWordIndexes.length > 1) {
                    //if word greater than length 1
                    strings.push(tempWordIndexes); //push array of indexes into strings
                } else if (tempWordIndexes.length == 1) {
                    if (this.CheckIslandLetter(tempWordIndexes[0])) {
                        strings.push(tempWordIndexes);
                    }
                }
                tempWordIndexes = []; //reset tempWordIndexes
                makingStringFlag = false;
            }
        }

        for (let i = 0; i < width; ++i) {
            for (let j = 0; j < height; ++j) {
                index = j * height + i;
                currentCharacter = this.array[index].Contents;
                if (currentCharacter != '') {
                    makingStringFlag = true; //set the flag to true
                    tempWordIndexes.push(index);
                } else {
                    //if current character is null
                    if (makingStringFlag) {
                        //if we are making a word
                        if (tempWordIndexes.length > 1) {
                            //if word greater than length 1
                            strings.push(tempWordIndexes); //push array of indexes into strings
                        }
                        tempWordIndexes = []; //reset tempWordIndexes
                        makingStringFlag = false;
                    }
                }
            }
            if (makingStringFlag) {
                //there was a word at end of row/column (to stop wrapping)
                if (tempWordIndexes.length > 1) {
                    //if word greater than length 1
                    strings.push(tempWordIndexes); //push array of indexes into strings
                }
                tempWordIndexes = []; //reset tempWordIndexes
                makingStringFlag = false;
            }
        }
        // var string;

        // for(let i = 0; i < strings.length; ++i) {
        //     string = '';
        //     for(let j = 0; j < strings[i].length; ++j) {
        //         string += this.array[strings[i][j]].Contents;
        //     }
        //     console.log(string);
        // } //this is all for checking if the indexes are correct
        return strings;
    }

    /**********************************************************************************************
     *   Function: getNewStrings()
     *
     *   Purpose:
     *
     *   Parameters: N/A
     *
     *   Precondition: N/A
     *
     *   Postcondition: Returns array of New strings greater than length 1 or is and island letter located on container (new based on IsNew data member)
     **********************************************************************************************/
    getNewStrings() {
        var stringIndexes = [];
        var tempStringIndexes = [];
        var makingStringFlag = false;
        var newWordFlag = false;
        var currentCharacter;
        var index;

        // TODO: Check ordering with different height/widths

        for (let i = 0; i < this.width; ++i) {
            //horizontal checking
            for (let j = 0; j < this.height; ++j) {
                index = i * this.width + j;
                currentCharacter = this.array[index].Contents;
                if (currentCharacter != '') {
                    makingStringFlag = true;
                    tempStringIndexes.push(index);
                    if (this.array[index].IsNew) {
                        newWordFlag = true;
                    }
                } else {
                    //current character is null
                    if (makingStringFlag && newWordFlag) {
                        if (tempStringIndexes.length > 1) {
                            //if word greater than length 1
                            if(this.CheckIslandWord(tempStringIndexes)) {
                                this.MarkWordInvalid(tempStringIndexes);
                                return [];
                            }
                            stringIndexes.push(tempStringIndexes); //push array of indexes into strings
                        }
                        else if(tempStringIndexes.length == 1){ //the word is 1 long
                            if(this.CheckIslandLetter(tempStringIndexes[0])){
                                stringIndexes.push(tempStringIndexes);

                                this.MarkWordInvalid(tempStringIndexes); //TODO: get rid of these 2 lines when we can verify a word
                                return [];
                            }
                        }
                    }
                    tempStringIndexes = []; //reset tempWordIndexes
                    makingStringFlag = false;
                    newWordFlag = false;
                }
            }
            if (makingStringFlag && newWordFlag) {
                if (tempStringIndexes.length > 1) {
                    //if word greater than length 1
                    if(this.CheckIslandWord(tempStringIndexes)) {
                        this.MarkWordInvalid(tempStringIndexes);
                        return [];
                    }
                    stringIndexes.push(tempStringIndexes); //push array of indexes into strings
                }
                else if(tempStringIndexes.length == 1){ //the word is 1 long
                    if(this.CheckIslandLetter(tempStringIndexes[0])){
                        stringIndexes.push(tempStringIndexes);

                        this.MarkWordInvalid(tempStringIndexes); //TODO: get rid of these 2 lines when we can verify a word
                        return [];
                    }
                }
            }
            tempStringIndexes = []; //reset tempWordIndexes
            makingStringFlag = false;
            newWordFlag = false;
        }

        for (let i = 0; i < this.width; ++i) {
            //vertical checking
            for (let j = 0; j < this.height; ++j) {
                index = j * this.width + i;
                currentCharacter = this.array[index].Contents;
                if (currentCharacter != '') {
                    makingStringFlag = true;
                    tempStringIndexes.push(index);
                    if (this.array[index].IsNew) {
                        newWordFlag = true;
                    }
                } else {
                    //current character is null
                    if (makingStringFlag && newWordFlag) {
                        //
                        if (tempStringIndexes.length > 1) {
                            //if word greater than length 1
                            if(this.CheckIslandWord(tempStringIndexes)) {
                                this.MarkWordInvalid(tempStringIndexes);
                                return [];
                            }
                            stringIndexes.push(tempStringIndexes); //push array of indexes into strings
                        }
                        else if(tempStringIndexes.length == 1){ //the word is 1 long
                            if(this.CheckIslandLetter(tempStringIndexes[0])){
                                stringIndexes.push(tempStringIndexes);

                                this.MarkWordInvalid(tempStringIndexes); //TODO: get rid of these 2 lines when we can verify a word
                                return [];
                            }
                        }
                    }
                    tempStringIndexes = []; //reset tempWordIndexes
                    makingStringFlag = false;
                    newWordFlag = false;
                }
            }
            if (makingStringFlag && newWordFlag) {
                if (tempStringIndexes.length > 1) {
                    //if word greater than length 1
                    if(this.CheckIslandWord(tempStringIndexes)) {
                        this.MarkWordInvalid(tempStringIndexes);
                        return [];
                    }
                    stringIndexes.push(tempStringIndexes); //push array of indexes into strings
                }
                else if(tempStringIndexes.length == 1){ //the word is 1 long
                    if(this.CheckIslandLetter(tempStringIndexes[0])){
                        stringIndexes.push(tempStringIndexes);

                        this.MarkWordInvalid(tempStringIndexes); //TODO: get rid of these 2 lines when we can verify a word
                        return [];
                    }
                }
            }
            tempStringIndexes = []; //reset tempWordIndexes
            makingStringFlag = false;
            newWordFlag = false;
        }
        return stringIndexes;
    }

    /**********************************************************************************************
     *   Function: CheckIslandLetter()
     *
     *   Purpose: Checks if there is a random letter placed on board with nothing connected (we don't want those to be playable)
     *
     *   Parameters: index - Index of letter
     *
     *   Precondition: Word of length 1 found on the board
     *
     *   Postcondition: If the word doesn't have any connected letters, returns true. else, returns false
     **********************************************************************************************/
    CheckIslandLetter(index) {
        var island = false;
        const { array } = this;
        const letterLeft = this.array[index - 1];
        const letterRight = this.array[index + 1];
        const letterUp = this.array[Number(index) - Number(this.width)];
        const letterDown = this.array[Number(index) + Number(this.width)];

        if (index >= 0 && index < this.width) {
            //top row of values
            if (index == 0) {
                // top left corner
                if (!array[1].Contents && !array[this.width].Contents) {
                    //checking array index 1 and row 1 col 0 for letters
                    island = true;
                }
            } else if (index == this.width - 1) {
                // top right corner
                if (!array[this.width - 2].Contents == '' && !array[this.width * 2 - 1].Contents) {
                    // checking array index 1 before end of row 0 and end of row 1
                    island = true;
                }
            } else {
                //top row somewhere in middle
                if (
                    !letterLeft.Contents &&
                    !letterRight.Contents &&
                    !letterDown.Contents
                ) {
                    //checking 1 before, after, and below index
                    island = true;
                }
            }
        } else if (index % this.width == 0) {
            //check for values on the left column

            if (index == this.width * (this.height - 1)) {
                //0th element of final row (bottom left corner)

                if (!letterUp.Contents && !letterRight.Contents) {
                    island = true;
                }
            } else {
                //all other tiles on left column (no need to check pos 0 because it won't reach here) (left middle)

                if (
                    !letterUp.Contents && //check one above it
                    !letterRight.Contents && // check to the right of it
                    !letterDown.Contents // check below it
                ) {
                    island = true;
                }
            }
        } else if (index % this.width == this.width - 1) {
            //check for values on the rightmost column
            if (index == this.width * this.height - 1) {
                //last element of the final column (bottom right corner)

                if (!letterLeft.Contents && !letterUp.Contents) {
                    island = true;
                }
            } else {
                //check all middle values on rightmost column

                if (
                    !letterLeft.Contents && //left of index
                    !letterUp.Contents && // 1 above index
                    !letterDown.Contents // one below index
                ) {
                    island = true;
                }
            }
        } //check for all values that aren't on the edge (everything in middle of board)
        else {
            if (
                !letterLeft.Contents && //one to the left
                !letterRight.Contents && //one to the right
                !letterUp.Contents && //one above
                !letterDown.Contents // one below
            ) {
                island = true;
            }
        }

        return island;
    }

    /**********************************************************************************************
     *   Function: CheckIslandWord(indexes)
     *
     *   Purpose: Checks if there is a random letter placed on board with nothing connected (we don't want those to be playable)
     *
     *   Parameters: indexes - Indexes of word we are checking
     *
     *   Precondition: Word of length >1 found on the board
     *
     *   Postcondition: If the word doesn't have any connected letters (word isn't touching existing words), returns true. else, returns false
     **********************************************************************************************/
    CheckIslandWord(indexes) {
        //the reason that there is a separation between an island letter and an island word is because
        //when checking a word that is played horizontal,
        //the vertical checking for words will see that as a bunch of 1 letter strings.
        //in order to check for words that have a longer length, you need to check that any of the letters in the indexes are old
        //(you have to play words off of existing words)

        if(indexes.length == 0) {
            return false;
        }

        for (let i = 0; i < indexes.length; ++i) { //base level checking of indexes to see if they are connected to a word
            if (!this.array[indexes[i]].IsNew) {
                //if any letter within the string is an already existing letter, it's not an island
                return false;
            }
            if(indexes[i] == this.Origin()) {
                return false; //if the word is made on the origin it isn't an island
            }
        }


        if(this.WordHorizontal(indexes)) { //if the word is horizontal
            //this if should occur when a word is not attached to another word (will check if adjacent to word or not)

            if(indexes[0] < this.width) { //word is on the first row
                for(let i = 0; i < indexes.length; ++i) {
                    if(!this.array[indexes[i] + Number(this.width)].IsNew) {
                        return false; //it's connected to an already existing character adjacent to it
                    }
                }
            }
            else if(indexes[0] > this.width * (this.height-1)){ //word is on the last row
                for(let i = 0; i < indexes.length; ++i) {

                    if(!this.array[indexes[i] - Number(this.width)].IsNew) {
                        return false; //it's connected to an already existing word adjacent to it
                    }
                }
            }
            else {
                for(let i = 0; i < indexes.length; ++i) {
                    if(!this.array[indexes[i] + Number(this.width)].IsNew) {
                        return false; //it's connected to an already existing character adjacent to it
                    }
                    else if(!this.array[indexes[i] - Number(this.width)].IsNew) {
                        return false; //it's connected to an already existing word adjacent to it
                    }
                }
            }
        }
        else if (this.WordVertical(indexes)) { //if the word is vertical
            if(indexes[0] % this.width == 0) { //on left wall
                for(let i = 0; i < indexes.length; ++i) {
                    if(!this.array[indexes[i]+1].IsNew) {
                        return false;
                    }
                }
            }
            else if(indexes[0] % this.width == this.width - 1){ // on right wall
                for(let i = 0; i < indexes.length; ++i) {
                    if(!this.array[indexes[i]-1].IsNew) {
                        return false;
                    }
                }
            }
            else {
                for(let i = 0; i < indexes.length; ++i) { //somewhere in the middle
                    if(!this.array[indexes[i]+1].IsNew) {
                        return false;
                    }
                    else if(!this.array[indexes[i]-1].IsNew) {
                        return false;
                    }
                }
            }
        }
        else { //if the word isn't solely vertical or horizontal
            console.log('there was an error with the direction of the word');
        }



        return true;
    }

    /**********************************************************************************************
     *   Function: GetNewLetters
     *
     *   Purpose: Checks if there is a random letter placed on board with nothing connected (we don't want those to be playable)
     *
     *   Parameters: N/A
     *
     *   Precondition: CheckCont needs to be called
     *
     *   Postcondition: Returns array of index positions for new letters
     **********************************************************************************************/
    GetNewLetters() {
        let newLetters = [];
        for(let i = 0; i < this.width * this.height; ++i) {
            if(this.array[i].IsNew == true && this.array[i].Contents != '') {
                newLetters.push(i)
            }
        }
        return newLetters;
    }

    WordVertical(Letters) {
        let vertical = false;
        if(Letters.length == 1) {
            vertical = true;
        }
        else {
            for(let i = 1; i < Letters.length; ++i) {
                if(Letters[i] % this.width != Letters[i-1] % this.width){
                    vertical = false; //just in case?
                    return vertical;
                } 
            }
            vertical = true;
        }
        return vertical
    }

    WordHorizontal(Letters) {
        let horizontal = false;
        if(Letters.length == 1) {
            horizontal = true;
        }
        else {
            for(let i = 1; i < Letters.length; ++i) {
                if(Letters[i] != Letters[i-1] + 1){
                    horizontal = false; //just in case?
                    return horizontal;
                } 
            }
            horizontal = true;
        }
        return horizontal;
    }

    UnFreeze() {
        for (let i = 0; i < this.width * this.height; ++i) {
            setAllowDragId(this.array[i].Id);
            this.UpdateColor(i, "", 1);
        }
    }

    /**********************************************************************************************
     *   Function: FormatId(id)
     *
     *   Purpose: Return a string with the id format used when calling get by id functions
     *
     *   Parameters: N/A
     *
     *   Precondition: Container is created with set of ids
     *
     *   Postcondition: String returned in "containerid_#" format
     **********************************************************************************************/
    FormatId(id) {
        return this.containerId + "_" + id;
    }

    /**********************************************************************************************
     *   Function: Randomize(range)
     *
     *   Purpose: Return a random number within a given range
     *
     *   Parameters: N/A
     *
     *   Precondition: N/A
     *
     *   Postcondition: Random number returned
     **********************************************************************************************/
    Randomize(range) {
        return Math.floor(Math.random() * range);
    }

    SetAllTilesDragAndDrop() { //will leave frozen tiles inert
        for(let i = 0; i < this.width * this.height; ++i) {
            if(document.getElementById(this.FormatId(i)).style.borderColor != 'var(--blueTile)') {
                setAllowDragId(this.array[i].Id);
            }
            
        }
    }

    SetAllTilesInert() {
        for(let i = 0; i < this.width * this.height; ++i) {
            setInertId(this.array[i].Id);
        }
    }

    /**********************************************************************************************
     *   Function: CheckCont()
     *
     *   Purpose: Loops through grid and checks if new words are continuous in one direction
     *
     *   Parameters: N/A
     *
     *   Precondition: end of turn condition is called
     *
     *   Postcondition: true if new letters are continuous and false if new letters are not continuous
     **********************************************************************************************/
    CheckCont(){
        const checkPos = this.GetNewLetters();
        const size = checkPos.length;
        if (size > 1) {
            const firstLetter = checkPos[0];
            const secondLetter = checkPos[1];
            const checkDifference = secondLetter - firstLetter;

            if(checkDifference >= this.width) { //alignment is vertical
                if(checkDifference % this.width != 0) {//they aren't on the same vertical
                    return false;
                } else {
                    for(let i = 0; i < size - 1; ++i) { //loop through all of the new letters
                        if((checkPos[i+1] - checkPos[i]) % this.width != 0) {
                            return false;
                        }
                        if(checkPos[i+1] - checkPos[i] > this.width) { //there is more than a 1 gap between the letters 
                            for(let ii = 1; ii < (checkPos[i+1] - checkPos[i])/this.width ; ++ii) { //loop for how many letters of a gap there is
                                if(this.array[checkPos[i] + Number(this.width) * ii].Contents == '') {
                                    return false;
                                }
                            }
                        }
                    }
                }

            } else { //alignment is horizontal
                for(let i = 0; i < size - 1; ++i) {
                    if(checkPos[i+1]-checkPos[i] >= this.width) { //the difference between 2 letters is bigger than what a horizontal word would allow
                        return false
                    }
                    if(checkPos[i+1]-checkPos[i] > 1) { //there is a larger than 1 gap between 2 letters
                        for(let ii = 1; ii < (checkPos[i+1] - checkPos[i]); ++ii) { //loop through however many letters are between the 2 positions
                            if(this.array[checkPos[i]+ii].Contents == ''){ //a letter between the 2 positions says it's new (meaning that there's a blank space)
                                return false;
                            }
                        }
                    }
                }
            }
        }
        return true;
    }
}

function ReturnGrid(Object)
{
    let container = new Container();
    container.height = Number(Object.height);
    container.width = Number(Object.width);
    container.containerId = Object.containerId;
    container.effectCount = Number(Object.effectCount);
    container.array = [];
    for(let i = 0; i < container.width * container.height; ++i) {
        if(Object.array[i].Type == 'Blank Tile') {
            //console.log('we got into making a blank tile');
            container.array[i] = new BlankTile(Object.array[i].Id, Object.array[i].Contents, Object.array[i].IsNew)
        }
        else if(Object.array[i].Type == 'Red Tile') {
            container.array[i] = new RedTile(Object.array[i].Id, Object.array[i].Contents, Object.array[i].IsNew)
        }  
        else if(Object.array[i].Type == 'Blue Tile')
            container.array[i] = new BlueTile(Object.array[i].Id, Object.array[i].Contents, Object.array[i].IsNew)
        else if(Object.array[i].Type == 'Green Tile')
            container.array[i] = new GreenTile(Object.array[i].Id, Object.array[i].Contents, Object.array[i].IsNew)
        else if(Object.array[i].Type == 'Yellow Tile')
            container.array[i] = new YellowTile(Object.array[i].Id, Object.array[i].Contents, Object.array[i].IsNew)
        else if(Object.array[i].Type == 'Wild Tile')
            container.array[i] = new WildTile(Object.array[i].Id, Object.array[i].Contents, Object.array[i].IsNew)

    }
    return container;
}

function ReturnHashTable(Object) {
    let temp = new HashTable();
    temp.num_words = Object.num_words;
    for(let i = 0; i < 26; i++) {
        temp.buckets[i] = Object.buckets[i];
    }
    return temp;
}

function logMessage(message) {
    var logBox = document.getElementById('log-box');
    logBox.innerHTML += message + '<br>';
}
//logMessage('This is a log message.');

/**********************************************************************************************
*   Function: MakeAmongus()//! Depreciated, kept for posterity
*
*   Purpose: ඞ
*
*   Parameters: ඞ
*
*   Precondition: ඞ
*
*   Postcondition: ඞ
**********************************************************************************************/
function MakeAmongus() {
    var redSection = [
        52, 53, 54, 55, 66, 67, 68, 69, 70, 71, 81, 82, 83, 96, 97, 98, 111, 112, 113, 114, 115,
        116, 126, 127, 128, 129, 130, 131, 141, 142, 145, 146, 156, 157, 160, 161, 80, 95, 110,
    ];
    var blueSection = [84, 85, 86, 87, 99, 100, 101, 102];
    grid.UpdateMultiple(redSection, "red");
    grid.UpdateMultiple(blueSection, "blue");
}

const width = localStorage.getItem("width") || 15;
const height = localStorage.getItem("height") || 15;
const effectCount = localStorage.getItem("effectCount") || 35;
const word_bank_option = localStorage.getItem("word_bank_option") || 0;
let word_bank_file = null;
if(word_bank_option != 0) {
word_bank_file = JSON.parse(localStorage.getItem("word_bank_file"));
temp = new HashTable();
_.extend(temp, JSON.parse(localStorage.getItem("word_bank_file")))
console.log(word_bank_file)
}
const gridContainers = document.querySelectorAll('.container');

// loop through each grid container
gridContainers.forEach((container) => {
    container.style.gridTemplateColumns = `repeat(${width}, 55px)`;
    container.style.gridTemplateRows = `repeat(${height}, 55px)`;
});//TODO maybe put the minmax back

// Creating the board and hand grids
let grid = new Container(width, height, "entiregrid", word_bank_option, word_bank_file);
const hand = new Container(10, 1, "handoftiles");

//grid.GenerateNewBoard();

grid.effectCount = effectCount;
//0 to enable drag (hand)
//1 to enable drop receive (board)
//else to do default (neither)
hand.MakeBoard(0);
grid.MakeBoard(1);

const letterValueDict = JSON.parse(localStorage.getItem("letterValueDict"));

// Iterate through letter-value pairs and apply to `setValue` function
for (const [letter, value] of Object.entries(letterValueDict)) {
    setValue(letter, value);
}

const theme = localStorage.getItem("themeName") || "Normal";
setTheme(theme);

module.exports = {ReturnGrid, Container};