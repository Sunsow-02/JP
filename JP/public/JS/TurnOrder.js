//Created by: Vincent Siu
//Description: Contains functions to randomize turn order and do other miscelaneous things
//Last edited by: Vincent Siu on 3/13/2023
//Last edited description: wrapped up testing 

import Player from './JS/PlayerClass.js'

//this function takes an array of player instances and shuffles them
//if turn order is conducted/game loop is done using this array, then if this function is run every game
// we will have random turn order for each
//the array will work for any positive int
function RandomTurnOrder(PlayerArray)
{
    //this uses the fisher-yates algorithmn and will shuffle the player instances in the array in a random order
    let len = PlayerArray.length; 
    let x; 
    for (x = len -1; x > 0; x--) 
    { 
        var y = Math.floor(Math.random() * x) 
        var temp = PlayerArray[x] 
        PlayerArray[x] = PlayerArray[y] 
        PlayerArray[y] = temp 
    } 

    //return the shuffled array
    //this does assume that whatever taking care of turn order will go element by element in the array
    return PlayerArray;
}

//function to create an array of players
//creates an initializes an array if the number provided is greater then zero, else returns a null
function CreatePlayerArray(player_count)
{
    let player_array
    //having an array with 0 or less players makes no sense
    if (player_count > 0)
    {
        player_array = new Array(player_count);
        let x
        for (x = 0; x < player_count; x++)
        {
            player_array[x] = new Player(x)
        }
    }
    else
        player_array = null;
    
    return player_array;
}