//Created by: Vincent Siu
//Description: Contains the player class
//Last edited by: Vincent Siu on 2/27/2023
//Last edited description: deprecated time data member

/************************************************************************
* Class: Player
*
* Purpose: be the player class
*
* Manager functions:
*		constructor() - default ctor
*
* Methods:
*       getters/setters for id
*       setter for hp
*       function to call if a player instance takes damage
*       function to call if a player instance heals
*		
* ...
*************************************************************************/

class Player {
    //default ctor and initialize data members
    constructor(id, username, room,  hp = 150) {
        this.m_id = id;
        this.m_username = username;
        this.m_room = room;
        this.m_hp = hp;
        this.m_is_alive = true;
        //this.m_time = new Date(0,0,0,0,5); //5 minutes
    }

    //to do: add multi arg ctors when we have the config menu

    //take damage and calculate appropriate hp value/check for if dead or not
    takeDamage(damage) {
        this.m_hp -= damage;
        if(this.m_hp <= 0){
            this.m_is_alive = false; 
        }
    }

    //heal a certain amount
    heal(heal_amount) {
        this.m_hp += heal_amount;
    }

    //take away the time
    // takeAwayTime(time_elapsed) {
    //     let old_time = this.getTime
    //     this.m_time = this.m_time.setMinutes(old_time.getMinutes() - time_elapsed)
    // }
}

module.exports =  {Player};

//let test = new Player(1)
//let test_time = new Date(0,0,0,0,2)
//test_time.setMinutes(2)
//test.takeAwayTime(test_time)
//console.log(test.getTime)
