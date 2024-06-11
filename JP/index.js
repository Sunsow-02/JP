// const sql = require('tedious')
// const test = require('./database/Work')
// //new test.dbClass.queryString("Word")
// async function Main(){//great example of how the handler function should work
//     const db = new test.dbClass()
//     try {
//         await db.connect()
//         var check = await db.queryString("back")
//         console.log(check)
//     }
//     catch (error) {
//         console.log(error)
//     }
//     db.close()//make sure you close
// }
//need to make an http request(aka ajax or fetch request)
//Main()

const express = require("express");
const test = require("./database/Work");
const cors = require("cors");
const PORT = 7000;
var connected = false;

const db = new test.dbClass();
const app = express();
app.use(cors());

async function VerifyWord(word) {
    try {
        if (!connected) {
            await db.connect();
            connected = true;
        }
           

        var check = await db.queryString(word);
        console.log(check);
        //await db.close();
    } 
    catch (error) {
        console.log(error);
        //throw error;
    } 
}

//dbStuff("keenasdfjklhl");

app.get("/results", async function (req, res) {
    const RESULT = await VerifyWord(req.query.search);
    //console.log(RESULT);
    //res.json(dbStuff("word"));
    res.json(RESULT);
});

app.listen(PORT, () => console.log(`server running on port ${PORT}`));
