//Created by: Vincent Siu
//Description: Contains the tile class (tiles on the board and tiles in a player's hand)
//Last edited by: Vincent Siu on 2/10/2023
//Last edited description: refactored documentation so it is more intelligent, and deprecated wildTile

//ITile is the base class of all tile classes
class ITile {
    //due to javascript acting weird, you can just access them directly but using the functions will work the same if not better since they show exactly what is happening
    Id; //the id of the tile that also stands for where it is
    Type; //what type of tile is it (blank, red, blue, green, yellow)
    Contents; //what is "on" the tile (empty if nothing)
    IsNew; //states whether tile is newly placed on board

    constructor(NewId, NewType, NewContents = "", IsNew = true) {
        this.Id = NewId;
        this.Type = NewType;
        this.Contents = NewContents;
        this.IsNew = IsNew;
    }

    //commented out as it wasn't being used and was causing compiling issues after a merge
    // constructor(Id)
    // {
    //     this.Id = Id;
    //     this.Type = 'Blank Tile';
    //     this.Contents = null;
    // }
}

//BlankTile has no color - meant to be used on the board. Effect - none
class BlankTile extends ITile {
    constructor(Id, Contents = "", IsNew = true) {
        super(Id, "Blank Tile", Contents, IsNew);
    }
}

//RedTile for board use. Effect - multiply damage done
class RedTile extends ITile {
    constructor(Id, Contents = "", IsNew = true) {
        super(Id, "Red Tile", Contents, IsNew);
    }

    CalculateEffect(damage) {
        return Math.ceil(damage * (1.1 + Math.random() * 0.3));
    }
}

//BlueTile for board use. Effect - freeze tiles in a opponent's hand
class BlueTile extends ITile {
    constructor(Id, Contents = "", IsNew = true) {
        super(Id, "Blue Tile", Contents, IsNew);
    }

    CalculateEffect(container) {
        var frozen = []; // array of indexes that are already frozen
        //loop through player's hand of tiles and freeze half of them at random
        let index = Math.floor(Math.random() * (container.width * container.height));
        frozen[0] = index;
        for (let i = 0; i < Math.floor((container.width * container.height) / 4) + 1; ++i) {
            let pass = false;

            do {
                index = Math.floor(Math.random() * (container.width * container.height)); // create a number within the bounds of container array
                //loop through indexes already frozen within function so that index is unique.
                for (let j = 0; j < frozen.length; ++j) {
                    if (frozen[j] != index) {
                        pass = true;
                        frozen.push(index);
                        setInertId(container.array[index].Id);
                        container.UpdateColor(index, "blue", 1);
                    }
                }
            } while (pass == false);
        }
    }
}

//GreenTile effect - heal player
class GreenTile extends ITile {
    constructor(Id, Contents = "", IsNew = true) {
        super(Id, "Green Tile", Contents, IsNew);
    }

    CalculateEffect(damage) {
        if (damage <= 0) {
            //some handling for when there's multiple green tiles, maybe a slight multiplier?
        } else {
            damage = -damage;
        }
        return damage;
    }
}

//YellowTile effect - shuffle board
class YellowTile extends ITile {
    constructor(Id, Contents = "", IsNew = true) {
        super(Id, "Yellow Tile", Contents, IsNew);
    }

    //calculateEffect for yellow tile shuffles all of the words that are played on the board. this is after already handling the word.
    CalculateEffect(container) {
        var strings = container.getAllStringIndexes();
        for (let i = 0; i < strings.length; ++i) {
            this.Scramble(strings[i], container);
        }
        container.UpdateLetters();
    }

    Scramble(word, container) {
        //word is an array of indexes that contain the word
        const wordLength = word.length;
        for (let i = 0; i < wordLength; i++) {
            const randomPos = Math.floor(Math.random() * wordLength); //get number between 0 and size of word
            const letterA = container.array[word[i]];
            const letterB = container.array[word[randomPos]];

            const temp = letterA.Contents;
            letterA.Contents = letterB.Contents;
            letterB.Contents = temp;
        }
    }
}

//WildTile - to have an array of wacky and cool effects
class WildTile extends ITile {
    constructor(Id, Contents = "", IsNew = true) {
        super(Id, "Wild Tile", Contents, IsNew);
    }

    CalculateEffect(container, damage) {
        const effectsArray = [new RedTile(), new BlueTile(), new GreenTile(), new YellowTile()];

        // Generate a random index to select an effect from the effectsArray
        const randomIndex = Math.floor(Math.random() * effectsArray.length);

        // Call the CalculateEffect() method of the selected effect object with the appropriate argument(s)
        const selectedEffect = effectsArray[randomIndex];
        let effectFlag = null;
        let result = null;
        if (selectedEffect instanceof RedTile) {
            effectFlag = "red";
            result = selectedEffect.CalculateEffect(damage);
        } else if (selectedEffect instanceof BlueTile) {
            effectFlag = "blue";
            result = selectedEffect.CalculateEffect(container);
        } else if (selectedEffect instanceof GreenTile) {
            effectFlag = "green";
            result = selectedEffect.CalculateEffect(damage);
        } else if (selectedEffect instanceof YellowTile) {
            effectFlag = "yellow";
            result = selectedEffect.CalculateEffect(container);
        }
        return { flag: effectFlag, result: result };
    }
}

// below is test code for all classes
// test code for blankTile class
// let test = new BlankTile(20);
// console.log(test.getId());
// console.log(test.getType());
// test.setContents("blank1");
// console.log(test.getContents());
// test.setContents("blank2");
// console.log(test.getContents());

// test = new RedTile(2);
// console.log(test.getId());
// console.log(test.getType());
// test.setContents("r1");
// console.log(test.getContents());
// test.setContents("r2");
// console.log(test.getContents());

// test = new BlueTile(3);
// console.log(test.getId());
// console.log(test.getType());
// test.setContents("b1");
// console.log(test.getContents());
// test.setContents("b2");
// console.log(test.getContents());

// test = new GreenTile(4);
// console.log(test.getId());
// console.log(test.getType());
// test.setContents("g1");
// console.log(test.getContents());
// test.setContents("g2");
// console.log(test.getContents());

// test = new YellowTile(5);
// console.log(test.getId());
// console.log(test.getType());
// test.setContents("y1");
// console.log(test.getContents());
// test.setContents("y2");
// console.log(test.getContents());

//test = new WildTile(6);
//console.log(test.getId());
//console.log(test.getType());
//test.setContents("w1");
//console.log(test.getContents());
//test.setContents("w2");
//console.log(test.getContents());
