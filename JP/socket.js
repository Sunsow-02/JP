//constants for setting of connection
const path = require("path");
const http = require("http");
const express = require("express");
const cors     = require("cors");             //cors is so that fetch requests can work with an app.get
const socketio = require("socket.io");
const database = require("./database/Work");  //import database class
const { userJoin, GetRoomUser, UserLeave, GetCurrentUser, ChangeHP } = require("./public/JS/users");

const SERVERPORT = 3000 || process.env.PORT;  //port that the server is listening on
const DBPORT = 7000;

let CurrentGridHTML;
let currentGrid;

//let players = [];

//let current_turn = 0;
//let timeOut;

let rooms = [];
rooms.push('JavaScript'); // 0
rooms.push('Python'); // 1
rooms.push('PHP'); // 2
rooms.push('C#'); // 3
rooms.push('Ruby'); // 4
rooms.push('Java'); // 5

let current_turns = [];
for(let i = 0; i < 6; ++i) {
    current_turns[i] = 0;
}

const MAX_WAITING = 5000;

// function next_turn(user){
//     const users = GetRoomUser(user.room);
//     current_turn++;
//     current_turn %= users.length;
//     return users[current_turn];
//     //triggerTimeout();
// }

function next_turn(room) {
    for(let i = 0; i < rooms.length; ++i) {
        if(rooms[i] == room) {
            const users = GetRoomUser(room);
            current_turns[i]++;
            current_turns[i] %= users.length;
            //console.log(users[current_turns[i]].id);
            return users[current_turns[i]].id;
        }
    }

}

function triggerTimeout()
{
    timeOut = setTimeout(()=>
    {
        next_turn();
    }, MAX_WAITING);
}


function resetTime()
{
    if(typeof timeout === 'object')
    {
        clearTimeout(timeout);
    }
}

//setting up the connection
const app = express();
const app2 = express();

//create the server for socketio
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')));
//make sure express is using cors
app2.use(cors());

const db = new database.dbClass();

var connected = false;                        //this variable is used to show if the database has already been connected or not

//socket.emit  this is to the single client
//socket.broadcast.emit('message',)

//run when client connects
io.on('connection', socket => {
    socket.on('joinroom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        //TODO: limit player count

        //players.push(user);

        socket.join(user.room);

        io.to(socket.id).emit('Your_Id', socket.id);

        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: GetRoomUser(user.room)
        })

        io.to(user.room).emit('initialize_hand', socket.id);

        if(GetRoomUser(user.room).length == 1) {
            io.to(user.room).emit('generate_board');
            io.to(user.room).emit('Store_Board_State');
            io.to(user.room).emit('your_turn', socket.id);
        } else {
            io.to(socket.id).emit('Set_Grid', currentGrid, CurrentGridHTML);
            
        }
        io.to(GetCurrentUser(socket.id).room).emit('log_message', `Player: ${user.username} has joined the lobby`);

        // for(let i = 0; i < (GetRoomUser(user).length); ++i) {
        //     if(rooms[i] == user.room) {
        //         rooms[i].push(user);
        //     }
        // }
    });

    socket.on('Log_Message', (string) => {
        io.to(GetCurrentUser(socket.id).room).emit('log_message', string);
    })

    socket.on('Log_Turn', (uname, result) => {
        io.to(GetCurrentUser(socket.id).room).emit('Log_Turn_All', uname, result);
    })

    socket.on('Get_Grid', function () {
        io.to(GetCurrentUser(socket.id).room).emit('Set_Grid', currentGrid, CurrentGridHTML);
    });

    socket.on('Board_State', (grid, gridhtml) => {
        currentGrid = grid;
        CurrentGridHTML = gridhtml;
    })

    socket.on('pass_turn', function () {
        const user = GetCurrentUser(socket.id);
        const users = GetRoomUser(user.room);
        let done = false;
        do {
            done = false;
            const next = next_turn(user.room);
            const nextuser = GetCurrentUser(next);
            if(nextuser.User_alive) {
                done = true;
                io.to(user.room).emit('your_turn' ,next);
            }
        } while (done == false)
        

    });
    
    socket.on('GridChange', (grid, GridHTML) => {
        const user = GetCurrentUser(socket.id);
        //console.log(`this is grid within the GridChangeFunction:    ${grid.array[0].Type}`)
        //console.log(grid.array[0].Type);
        io.to(user.room).emit('UserGridChange', grid, GridHTML);
    });


    socket.on('deal_damage' , (result) => {
        const user = GetCurrentUser(socket.id);
        const users = GetRoomUser(user.room);
        for(let i = 0; i < users.length; ++i) {
            if(users[i] != user) {
                if(users[i].User_alive)
                    users[i].HP -= result[0]; //damage
                        if(users[i].HP <= 0) {
                            users[i].User_alive = false;
                        }
            } else {
                user.HP -= result[1]; //heal
            }
            //console.log(users[i].HP)
        }
        io.to(user.room).emit('display_hp', users);
        //console.log(result[2]);
        if(result[2] == true) {
            io.to(user.room).emit('freeze_hand', socket.id);
        }
        let total_alive = 0;
        let player_alive;
        for(let i = 0; i < users.length; ++i) {
            if(users[i].User_alive) {
                total_alive++;
                player_alive = users[i];
            }
        }

        if((total_alive < 2) && (users.length > 1)) {
            
            io.to(user.room).emit('end_game', player_alive.username);
        }

        //io.to(user.room).emit('Deal_Damage', result[0], user.username, GetRoomUser(user.room), GetRoomUser(user.room).length);
        //io.to(user.room).emit()
    });



    //setting up the board change to only be sent to the room once end tern is pushed
    //TODO: need to ask about how this will work with the board the way that it is.
    socket.on('disconnect', () => {
        let user = GetCurrentUser(socket.id);
        //const user = UserLeave(socket.id);
        //console.log(user);
        if (user) {
            const users = GetRoomUser(user.room);

            // if(users[current_turn] == user) { //current functionality for leaving
            //     io.to(user.room).emit('your_turn', next_turn(user).id);
            // }
            // current_turn--;
            // if(current_turn < 0) {
            //     current_turn = users.length - 1;
            // }
            for (let i = 0; i < rooms.length; ++i) {
                if (rooms[i] == user.room) {
                    if (users[current_turns[i]] == user) { //current functionality for leaving
                        io.to(user.room).emit('your_turn', next_turn(user.room));
                    }
                }
            }


            user = UserLeave(socket.id);
            if(user) {
                io.to(user.room).emit('roomUsers', {
                    room: user.room,
                    users: GetRoomUser(user.room)
                })
            }

        }
    });

    socket.on('self_damage', () => {
        const user = GetCurrentUser(socket.id);
        const users = GetRoomUser(user.room);
        for(let i = 0; i < users.length; ++i) {
            if(users[i] == user) {
                if(users[i].User_alive) {
                    users[i].HP -= 10;
                    if(users[i].HP <= 0) {
                        users[i].User_alive = false;
                    }
                }
            }
        }
        io.to(user.room).emit('display_hp', users);

        let total_alive = 0;
        let player_alive;
        for(let i = 0; i < users.length; ++i) {
            if(users[i].User_alive) {
                total_alive++;
                player_alive = users[i];
            }
        }

        if((total_alive < 2) && (users.length > 1)) {
            
            io.to(user.room).emit('end_game', player_alive.username);
        }
    });
});

server.listen(SERVERPORT, () =>
console.log(`Server has connected and is listening on ${SERVERPORT}`)
);

/**********************************************************************************************
 *   Function: VerifyWord(word)
 *
 *   Purpose: get the results of a query to show if a word was in the database or not
 *
 *   Parameters: word - word that we are testing is in the database
 *
 *   Precondition: calling end turn with a new word played onto grid
 *
 *   Postcondition: returns true if the word was in the database
 *                  returns false if the word was not in the database
 *                  logs an error if there was an issue connecting to the database
 *                  logs an error if there was an issue querying the database
 **********************************************************************************************/
async function VerifyWord(word) {
    let check = false;
    if (connected == false) {
        try {
            console.log("we attempted to connect");
            await db.connect();
            connected = true;
        } catch (err) {
            console.log(err);
        }
    }

    //these if statements need to be separate instead of an else because the condition of connected can change based on the success of
    if (connected == true) {
        try {
            //console.log("we attempted to query a string");
            check = await db.queryString(word);
            //console.log(check); //this log shows in the backend console if the word was correct or incorrect
            //await db.close();
            //console.log("we finished checking a string");
        } catch (err) {
            console.log(err);
        }
    }

    return check;
}

/**********************************************************************************************
 *   Purpose: get the results of VerifyWord and send it into a location we can access in the front end
 *
 *   Parameters: path ('/results') - this is where the result of the promise will go
 *               Promise - function that will call VerifyWord based on requested parameters
 *   PostCondition: Places result of VerifyWord into the /results directory so we can access it in the front end
 *
 **********************************************************************************************/
app2.get("/results", async function (req, res) {
    const RESULT = await VerifyWord(req.query.search);
    //console.log(RESULT);
    //res.json(dbStuff("word"))
    res.json(RESULT);
});

app2.listen(DBPORT, () => 
    console.log(`The Database has connected and is listening on ${DBPORT}`)
);







