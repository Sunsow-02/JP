/**********************************************************************************************
*   Function: allowDrop(ev)
*
*   Purpose: Prevents default event handling
*
*   Parameter: ev - Event to be handled
*
*   Precondition: Grid item has allowDrop(event) property
*
*   Postcondition: Grid item allows dragged items to be dropped on it
**********************************************************************************************/
function allowDrop(ev) {
    ev.preventDefault();
}

/**********************************************************************************************
*   Function: drag(ev)
*
*   Purpose: Obtains the data from the grid item being dragged
*
*   Parameter: ev - Event to be handled
*
*   Precondition: Grid item draggable element = true and has drag(event) property
*
*   Postcondition: Data is available to be dragged and dropped where needed
**********************************************************************************************/
function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);                // grab data from the tile being dragged
}

/**********************************************************************************************
*   Function: drop(ev)
*
*   Purpose: Sets data of grid item to be whatever was dropped on it, removes data from dragged 
*            element
*
*   Parameter: ev - Event to be handled
*
*   Precondition: Grid item has drop(event) property
*
*   Postcondition: Grid item is set to dragged element, dragged element is reset if dropped
*                  on element that allowed for drop
**********************************************************************************************/
function drop(ev) {
    ev.preventDefault();
    const data        = ev.dataTransfer.getData("text");            // get the id of the tile to drag
    const original    = document.getElementById(data);              // grab the original tile using the id
    const gridTarget  = document.getElementById(ev.target.id);      // grab the target grid item using the id
    const originIndex = original.id.split("_")[1];                  // grab the index of the array to remove the letter from
    const targetIndex = gridTarget.id.split("_")[1];                // grab the index of the array to place the letter in
    
    let isHandOriginal = false;
    if(original.id.split("_")[0] == "handoftiles")
        isHandOriginal = true;
    let isHandTarget = false;
    if(gridTarget.id.split("_")[0] == "handoftiles")
        isHandTarget = true;
    
    // allow for dropping the letter ONLY if space is empty
    if (ev.target.innerHTML == "") {
        // grid.array[targetIndex].setContents(original.innerHTML);  // add the letter to the array
        gridTarget.innerHTML = original.innerHTML;                // add the letter to the grid
        
        setAllowDrag(gridTarget);                                 // Set the target tile to allow for dragging, remove drop property
        original.innerHTML = "";                                  // Set the dragged tile blank

        if(isHandOriginal) {
            if(isHandTarget) {
                hand.array[targetIndex].Contents = hand.array[originIndex].Contents;
                hand.array[originIndex].Contents = '';   
            }
            else {
                grid.array[targetIndex].Contents = hand.array[originIndex].Contents;
                hand.array[originIndex].Contents = '';   
            }
        }         // remove the letter from the array IF it's not from the hand
        else {
            if(isHandTarget) {
                hand.array[targetIndex].Contents = grid.array[originIndex].Contents;
                grid.array[originIndex].Contents = '';   
            } else {
                grid.array[targetIndex].Contents = grid.array[originIndex].Contents;
                grid.array[originIndex].Contents = '';   
            }

        }
        grid.UnmarkInvalidWords();
        setAllowDrop(original);                                   // Set the original tile to allow for dropping, remove drag property
    }
}


/**********************************************************************************************
*   Function: setAllowDrag(tile)
*
*   Purpose: Sets a tile to allow drag
*
*   Parameter: tile - element to allow drag
*
*   Precondition: tile is not null
*
*   Postcondition: Element allows drag
**********************************************************************************************/
function setAllowDrag(tile){
    tile.setAttribute("ondrop", "false");                 // remove the ondrop attribute from target
    tile.setAttribute("ondragover", "false");             // remove the ondragover attribute from target
    tile.setAttribute("draggable", "true");               // set the draggable attribute to true
    tile.setAttribute("ondragstart", "drag(event)");      // set the ondragstart attribute to drag(event)
}

/**********************************************************************************************
*   Function: setAllowDrop(tile)
*
*   Purpose: Sets a tile to allow drop
*
*   Parameter: tile - element to allow drop
*
*   Precondition: tile is not null
*
*   Postcondition: Element allows drop
**********************************************************************************************/
function setAllowDrop(tile){
    tile.setAttribute("ondrop", "drop(event)");           // Set the ondrop attribute to drop(event)
    tile.setAttribute("ondragover", "allowDrop(event)");  // Set the ondragover attribute to allow dropping
    tile.setAttribute("draggable", "false");              // remove the draggable attribute
    tile.setAttribute("ondragstart", "false");            // remove the ondragstart attribute
}

/**********************************************************************************************
*   Function: setInert(tile)
*
*   Purpose: Sets a tile to allow neither drag nor drop
*
*   Parameter: tile - element to set inert
*
*   Precondition: tile is not null
*
*   Postcondition: Element does not allow drag nor drop
**********************************************************************************************/
function setInert(tile){
    tile.setAttribute("ondrop", "false");                 // remove the ondrop attribute from target
    tile.setAttribute("ondragover", "false");             // remove the ondragover attribute from target
    tile.setAttribute("draggable", "false");              // remove the draggable attribute
    tile.setAttribute("ondragstart", "false");            // remove the ondragstart attribute
}

/**********************************************************************************************
*   Function: setAllowDragId(tileId)
*
*   Purpose: Sets a tile to allow drag using the tile's tileId attribute
*
*   Parameter: tileId - id of element to set inert
*
*   Precondition: tile is not null
*
*   Postcondition: Element allows drag
**********************************************************************************************/
function setAllowDragId(tileId){
    let tile = document.getElementById(tileId);
    tile.setAttribute("ondrop", "false");                 // remove the ondrop attribute from target
    tile.setAttribute("ondragover", "false");             // remove the ondragover attribute from target
    tile.setAttribute("draggable", "true");               // set the draggable attribute to true
    tile.setAttribute("ondragstart", "drag(event)");      // set the ondragstart attribute to drag(event)
}

/**********************************************************************************************
*   Function: setInertId(tileId)
*
*   Purpose: Sets a tile to allow neither drag nor drop using the tile's tileId attribute
*
*   Parameter: tileId - id of element to set inert
*
*   Precondition: tile is not null
*
*   Postcondition: Element does not allow drag nor drop
**********************************************************************************************/
function setInertId(tileId){
    //let tileId prepend = "entiregrid_"+tileId;
    let tile = document.getElementById(tileId);
    tile.setAttribute("ondrop", "false");                 // remove the ondrop attribute from target
    tile.setAttribute("ondragover", "false");             // remove the ondragover attribute from target
    tile.setAttribute("draggable", "false");              // remove the draggable attribute
    tile.setAttribute("ondragstart", "false");            // remove the ondragstart attribute
}

