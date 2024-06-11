//import { Request } from '/node_modules/tedious';
const Request = require('tedious');
/***************
* Class: dbClass
* 
* Purpose: Handels connections and queries to the database
*
*
* Data Members: 
*   config - contains information vital to connection to the database
*
*
* Member Functions: 
*   (not implemented)queryString - A query function that passes in a string to be queried 
*                                  and returns a bool value "true" if the string is found
*                                  in the database
***************/
const Connection = Request.Connection;  
class dbClass
{
    constructor()
    {
        this.config = {  
            server: 'SATOU.cset.oit.edu', 
            authentication: 
            {
                type: 'default',
                options: 
                {
                    userName: 'jp_khaos_vindicated_user', //user account, NOT ADMIN
                    password: 'jp_khaos_vindicated_user'  
                }
            },
            options: 
            {
                port: 5433,
                trustServerCertificate: true,
                useColumnNames: true,
                encrypt: true,
                database: 'jp_khaos_vindicated'  //update me
            }
        };  
        this.dbClass = new Connection(this.config);
        //using this.dbClass as "connection"
    }

    /***************
    *  Function: connect
    * 
    *  Precondition: constructor conditions
    * 
    *  Postcondition: should be connected
    * 
    *  Potential updates: none
    ***************/
    connect()
    { 
        return new Promise((resolve, reject) => {
            this.dbClass.on('connect', function(err) 
            {  
                if(err){
                   
                    console.log("login failed");
                    reject(err);
                }
                else
                {
                    console.log("Connected");
                    resolve();
                }
                // If no error, then good to proceed.
                //use async or .then
            });        
            this.dbClass.connect();
        });
    }



    /***************
    *  Function: queryString
    * 
    *  Precondition: string to be checked
    * 
    *  Postcondition: Returns a bool value of the existence of the string queried
    *  
    *  Potential updates: may need to become a class or be moved
    ***************/
    queryString(checkMe)
    {
        //console.log(checkMe);
        var Request = require("tedious").Request;
        var TYPES = require('tedious').TYPES;
        var exists = false;
        return new Promise((resolve, reject) => {
            const request = new Request("SELECT COUNT(*) AS WordCount FROM EnglishDictionary WHERE Words LIKE @checkMe ", function(err){
                if (err) 
                {  
                    console.log(err)
                    reject();
                }  
                else
                {
                    resolve(exists);
                }
            });
            request.addParameter("checkMe", TYPES.VarChar, checkMe); 
            request.on('row', function(columns){  //execute for everyrow, should only only ever be one row
                exists = columns.WordCount.value > 0;
                //console.log("row check, exists: " + exists, " Columns: " + JSON.stringify(columns));
                //console.log(checkMe)
            });  

            //this.dbClass.close(); // make this its own function
            this.dbClass.execSql(request);
        });
    }
    

    close()
    {
        this.dbClass.close();
        console.log("Closed");
    }

}


module.exports = {dbClass,}
//export default dbClass