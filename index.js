/** Copyright © 2016, Okta, Inc.
 * 
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

// Dependencies
const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();  
const url = require('url');
const uuid = require('uuid');
const bodyParser = require('body-parser');
const util = require('util');

const db = new sqlite3.Database('test.db'); 

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/** 
 *   Constructor for creating SCIM Resource 
 */
function GetSCIMList(rows, startIndex, count, req_url) {
  const scim_resource =  {
    "Resources": [], 
    "itemsPerPage": 0, 
    "schemas": [
      "urn:ietf:params:scim:api:messages:2.0:ListResponse"
    ], 
    "startIndex": 0, 
    "totalResults": 0
  }

  let resources = [];
  let location = ""
  for (let i = (startIndex-1); i < count; i++) {
    location =  req_url + "/" + rows[i]["id"];
    let userResource = GetSCIMUserResource(
      rows[i]["id"],
      rows[i]["active"],
      rows[i]["userName"],
      rows[i]["givenName"],
      rows[i]["middleName"],
      rows[i]["familyName"],
      location);
    resources.push(userResource);
    location = "";
  }

  scim_resource["Resources"] = resources;
  scim_resource["startIndex"] = startIndex;
  scim_resource["itemsPerPage"] = count;
  scim_resource["totalResults"] = count

  return scim_resource;
}

/**
 *  Returns JSON dictionary of SCIM response
 */
function GetSCIMUserResource(userId, active, userName,
  givenName, middleName, familyName, req_url) {

  let scim_user = {
    "schemas": [ "urn:ietf:params:scim:schemas:core:2.0:User" ],
    "id": null,
    "userName": null,
    "name": {
      "givenName": null,
      "middleName": null,
      "familyName": null,
    },
    "active": false,
    "meta": {
      "resourceType": "User",
      "location": null,
    }
  };

  scim_user["meta"]["location"] = req_url;
  scim_user["id"] = userId;
  scim_user["active"] = active;
  scim_user["userName"] = userName;
  scim_user["name"]["givenName"] = givenName;
  scim_user["name"]["middleName"] = middleName;
  scim_user["name"]["familyName"] = familyName;

  return scim_user;

}

/**
 *  Returns an error message and status code
 */
function SCIMError(errorMessage, statusCode) {
  let scim_error = {
    "schemas": ["urn:ietf:params:scim:api:messages:2.0:Error"],
    "detail": null,
    "status": null
  }

  scim_error["detail"] = errorMessage;
  scim_error["status"] = statusCode;

  return scim_error;
}

/**
 *  Creates a new User with given attributes
 */
app.post('/scim/v2/Users',  function (req, res) {   
  const url_parts = url.parse(req.url, true);
  const req_url =  url_parts.pathname;

  const active = req.body.active;
  const userName = req.body.userName;
  const givenName = req.body.name.givenName;
  const middleName = req.body.name.middleName;
  const familyName = req.body.name.familyName;
  

  const usernameQuery = "SELECT * FROM Users WHERE userName='" + userName + "'";
  db.get(usernameQuery, function(err, rows) {
    if (err == null) {
      if (rows === undefined) {
        const userId = String(uuid.v1());
        const runQuery = "INSERT INTO 'Users' (id, active, userName, givenName,\
                     middleName, familyName) VALUES ('" + userId + "','" 
                     + active + "','" + userName + "','" + givenName + "','" + middleName + "','"
                     + familyName + "')";
        db.run(runQuery, function(err) {
          if (err !== null) {
            const scim_error = SCIMError( String(err), "400");
            res.writeHead(400, {'Content-Type': 'text/plain'});
            res.end(JSON.stringify(scim_error));
          } 
          
          else {
            const scimUserResource = GetSCIMUserResource(userId, active, userName,
              givenName, middleName, familyName, req_url); 
          
            res.writeHead(201, {'Content-Type': 'text/json'});
            res.end(JSON.stringify(scimUserResource));
          }
        });              
      } 
      
      else {
          const scim_error = SCIMError( "Conflict - Resource Already Exists", "409");
          res.writeHead(409, {'Content-Type': 'text/plain'});
          res.end(JSON.stringify(scim_error));
        }
    } 
    
    else {
        const scim_error = SCIMError( String(err), "400");
        res.writeHead(400, {'Content-Type': 'text/plain'});
        res.end(JSON.stringify(scim_error));
      }
  
  }); 
});

/**
 *  Return filtered Users stored in database
 *
 *  Pagination supported
 */
app.get("/scim/v2/Users", function (req, res) {
  console.log(req.query);
  const url_parts = url.parse(req.url, true);
  const query = url_parts.query;
  startIndex  = query["startIndex"];
  count = query["count"];
  filter = query["filter"];

  const req_url =  url_parts.pathname;
  const selectQuery = "SELECT * FROM Users";
  let queryAtrribute = "";
  let queryValue = "";

  if (filter != undefined) {
    queryAtrribute = String(filter.split("eq")[0]).trim();
    queryValue = String(filter.split("eq")[1]).trim();
    selectQuery = "SELECT * FROM Users WHERE " + queryAtrribute + " = " + queryValue;
  }

  db.all(selectQuery , function(err, rows) {
    if (err == null) {
      if (rows === undefined) {
        const scim_error = SCIMError( "User Not Found", "404");
          res.writeHead(404, {'Content-Type': 'text/plain'});
          res.end(JSON.stringify(scim_error));
      } else {
          // If requested no. of users is less than all users
          if (rows.length < count) {
            count = rows.length
          }
          
          const scimResource = GetSCIMList(rows,startIndex,count,req_url);
          res.writeHead(200, {'Content-Type': 'application/json'})
          res.end(JSON.stringify(scimResource))
        }
    } else {
        const scim_error = SCIMError( String(err), "400");
        res.writeHead(400, {'Content-Type': 'text/plain'});
        res.end(JSON.stringify(scim_error));
      }
  });
});

/**
 *  Queries database for User with identifier
 *
 *  Updates response code with '404' if unable to locate User
 */
app.get("/scim/v2/Users/:userId", function (req, res){
  const url_parts = url.parse(req.url, true);
  const query = url_parts.query;
  const userId = req.params.userId;
  
  startIndex  = query["startIndex"]
  count = query["count"]
  const req_url = req.url;
  const queryById = "SELECT * FROM Users WHERE id='" + userId + "'";

  db.get(queryById, function(err, rows) {
      if (err) {
        const scim_error = SCIMError( String(err), "400");
        res.writeHead(400, {'Content-Type': 'text/plain'});
        res.end(JSON.stringify(scim_error));
      }

      else if (!rows) {
        const scim_error = SCIMError( "User Not Found", "404");
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end(JSON.stringify(scim_error));
      }

      else {
        const scimUserResource = GetSCIMUserResource(userId, rows.active, rows.userName,
          rows.givenName, rows.middleName, rows.familyName, req_url);         
          res.writeHead(200, {'Content-Type': 'application/json'})
          res.end(JSON.stringify(scimUserResource));
      }
  });
});

/**
 *  Update User attributes via PUT
 */
app.put("/scim/v2/Users/:userId", function (req, res) {
	const userId = req.params.userId;
	const url_parts = url.parse(req.url, true);
	const req_url = url_parts.pathname;


  const active = req.body.active;
  const userName = req.body.userName;
  const givenName = req.body.name.givenName;
  const middleName = req.body.name.middleName;
  const familyName = req.body.name.familyName;
  const queryById = "SELECT * FROM Users WHERE id='" + userId + "'";

  db.get(queryById, function(err, rows) {
    if (err == null) {
      if (rows != undefined){
        const updateUsersQuery = "UPDATE 'Users' SET userName = '" + String(userName)
          + "', givenName = '" + String(givenName) + "', middleName ='"
          + String(middleName) + "', familyName= '" + String(familyName)
          + "'   WHERE id = '" + userId + "'";
        
        db.run(updateUsersQuery, function(err) {
          if(err !== null) {
            const scim_error = SCIMError( String(err), "400");
            res.writeHead(400, {'Content-Type': 'text/plain'});
            res.end(JSON.stringify(scim_error));
          } 
          
          else {
              const scimUserResource = GetSCIMUserResource(userId, active, userName,
                givenName, middleName, familyName, req_url); 
              res.writeHead(201, {'Content-Type': 'text/json'});
              res.end(JSON.stringify(scimUserResource));
            }
        });
      } 
      
      else {
          const scim_error = SCIMError( "User Does Not Exist", "404");
          res.writeHead(404, {'Content-Type': 'text/plain'});
          res.end(JSON.stringify(scim_error));
        }
    } 
    
    else {
        const scim_error = SCIMError( String(err), "400");
        res.writeHead(400, {'Content-Type': 'text/plain'});
        res.end(JSON.stringify(scim_error));
      }
  });

});

app.delete("/scim/v2/Users/:userID", function(req, res) {
  const userID = req.params.userID;
  const query = "DELETE FROM Users WHERE id = '" + userID + "'";
  console.log(query);
  db.run(query, function(err) {
    if (err) {
      const scim_error = SCIMError( String(err), "400");
      res.writeHead(400, {'Content-Type': 'text/plain'});
      res.end(JSON.stringify(scim_error));
    }

    console.log(`just deleted ${userID}`);
  });
});

app.post('/scim/v2/Groups/', function(req, res) {
  const url_parts = url.parse(req.url, true);
  const req_url =  url_parts.pathname;

  
});

/**
 *  Instantiates or connects to DB
 */
const server = app.listen(8081, function () {
  const databaseQuery = "SELECT name FROM sqlite_master WHERE type='table'";
  db.all(databaseQuery, function(err, rows) {
    if(err !== null) { console.log(err); }
    else if(rows === undefined) {
      const createTable = 'CREATE TABLE Users ("id" primary key, \
        "active" INTEGER,"userName" VARCHAR(255), \
        "givenName" VARCHAR(255), "middleName" VARCHAR(255), \
        "familyName" VARCHAR(255))';
      db.run(createTable, function(err) {
        if(err !== null) { console.log(err); }
      });
    }
    else if (rows.length < 2) {
      console.log(`we only found ${(util.inspect(rows,{showHidden: false, depth: null}))}`);
      const createTable = 'CREATE TABLE Groups ("id" primary key, \
        "active" INTEGER,"userName" VARCHAR(255), \
        "givenName" VARCHAR(255), "middleName" VARCHAR(255), \
        "familyName" VARCHAR(255))';
      
        db.run(createTable, function(err) {
        if(err !== null) { console.log(err); }
      });
    }
    else {

      console.log((util.inspect(rows,{showHidden: false, depth: null})));
    }
  }); 
});