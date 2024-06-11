//let player = require('./PlayerClass');

//let Players = player.Player




const users = [];

// Join users to chat

function userJoin(id, username, room){
    HP = 150;
    User_alive = true;


    let user = {id, username, room, HP, User_alive};
    //let Nplayer = new Players(id, username, room);
    users.push(user);
    return user;
}



// Get the current user

function GetCurrentUser(id)
{
    return users.find(user => user.id === id);
}


//User leave chat 
function UserLeave(id)
{
    const index = users.indexOf(users.find(user => user.id === id));

    if (index !== -1)
    {
        return users.splice(index, 1)[0];
    }
}

//Get room user users

function GetRoomUser(room)
{
    return users.filter(user => user.room === room);
}


async function ChangeHP(user)
{
    
    while(user.User_alive)
    {
        //await wait(2000);
        user.HP -= 1;
    }
    


}

module.exports = {
    userJoin, GetCurrentUser,
    UserLeave, GetRoomUser,
    ChangeHP
};