const Endturn = document.getElementById("EndTurn");
const newHand = document.getElementById("newHand");
const GenerateGrid = document.getElementById("GenerateGrid");


let GridHTML = document.getElementById("entiregrid");
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const userHP = document.getElementById('HP');



let totalplayers = 0;
let params = new URLSearchParams(location.search, {ignoreQueryprefix: true});

let usersocketid;

const username = localStorage.getItem('username');
const room = localStorage.getItem('room');

//localStorage.removeItem('username');
//localStorage.removeItem('room');

//const CurrentUser = new Player(username);

const socket = io();

// Join the room
socket.emit('joinroom', { username: username, room });
// Get the room and user information
socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room);
    displayPlayer(users);
    displayPlayerHP(users);
})

socket.on('Your_Id', (socketid) => {
    usersocketid = socketid;
})

//end turn

Endturn.addEventListener('click', async (e) => {

    e.preventDefault();
    //console.log(grid);
    Endturn.style.visibility = 'hidden';
    newHand.style.visibility = 'hidden';

    const result = await EndTurn(grid);
    //console.log(grid);
    if(result.length != 0) 
    {
        //logMessage(`User: ${username}, Damage: ${result[0]}, Healing: ${-result[1]}`);
        socket.emit('Log_Turn', username, result);
        hand.FillHand();
        GridHTML.innerHTML = document.getElementById("entiregrid").innerHTML;

        hand.UnFreeze();
        
        //console.log(`original grid ${grid.array[0].Type}`);
        socket.emit('Board_State', grid, GridHTML.innerHTML);
        socket.emit('GridChange', grid, GridHTML.innerHTML);
        socket.emit('deal_damage', result);
        socket.emit('pass_turn');
    }
    else
    {
        Endturn.style.visibility = 'visible';
        newHand.style.visibility = 'visible';
    }


});

newHand.addEventListener('click', async (e) => {

    e.preventDefault();

    hand.NewHand();
    hand.UnFreeze();
    socket.emit('Log_Message', `Player: ${username} has generated a new hand. this has passed their turn and dealt them 10 damage`);
    socket.emit('Get_Grid');
    socket.emit('self_damage');
    socket.emit('pass_turn');
});

socket.on('log_message', (string) => {
    logMessage(string);
})

socket.on('Store_Board_State', function ()  {
    
    socket.emit('Board_State', grid, GridHTML.innerHTML);
});

socket.on('end_game', (uname) => {
    logMessage(`Player: ${uname} has won the game`);
    alert(`Player: ${uname} has won the game`);
})

socket.on('Set_Grid', function (servergrid, servergridhtml) {
    grid = ReturnGrid(servergrid);
    GridHTML.innerHTML = servergridhtml
});

socket.on('UserGridChange', (EmittedGrid, EmittedGridHTML) => {
    //console.log(`this is grid within the userchangegrid function${EmittedGrid.array}`);

    grid = ReturnGrid(EmittedGrid);
    //console.log(`EmittedGrid: ${EmittedGrid.array[0].Type}`);
    //console.log(grid);
    document.getElementById("entiregrid").innerHTML = EmittedGridHTML;
    //Grid html
    //location.reload()
});

socket.on('display_hp', (users) => {
    HP.innerHTML = '';
    displayPlayerHP(users);
});

socket.on('Deal_Damage', (value, user, users, userlength) => {
    ChangeHP(value, user, users, userlength);
});

socket.on('generate_board', function () {
    grid.GenerateNewBoard();
}); 

socket.on('initialize_hand', function (socketid) {
    //console.log(`we get in here`);
    if(socketid == usersocketid) {
        hand.NewHand();
        hand.SetAllTilesInert();
    }
});

socket.on('your_turn', async function (socketid) {
    if(socketid == usersocketid) {
        GenerateGrid.style.visibility = 'hidden';
        Endturn.style.visibility = 'visible';
        newHand.style.visibility = 'visible';
        hand.SetAllTilesDragAndDrop();
        socket.emit('Log_Message', `Current Turn: ${username}`);
    }
    else {
        GenerateGrid.style.visibility = 'hidden';
        Endturn.style.visibility = 'hidden';
        newHand.style.visibility = 'hidden';
        hand.SetAllTilesInert();
    }
});

socket.on('freeze_hand', function (socketid) {
    if(socketid != usersocketid) {
        const stuff = new BlueTile();
        stuff.CalculateEffect(hand);
    }
});

socket.on('Log_Turn_All', (uname, result) => {
    logMessage(`User: ${uname} has finished their turn. Damage Dealt: ${result[0]}, Healing Received: ${-result[1]}`);
    logMessage(`Freezing Opponent's Hand: ${result[2]}, Scramble Letters: ${result[3]}`);
})



function outputRoomName(room)
{
    roomName.innerText = room;
}

function displayPlayer(users)
{
    userList.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join('')}`;
}

function displayPlayerHP(users)
{
    HP.innerHTML = `${users.map(user => `<li>`+(user.User_alive ? user.HP : 'Dead') +`</li>`).join('')}`;
}


