(function () {

});

const player = {
    name: '',
    health: 100,
    
}


function $(id)
{
    return document.getElementById(id);
}
let health = $('Health');

let lobby = prompt ("Enter the name of the lobby");
let game = lobby;
lobby = lobby + 'lobby';

