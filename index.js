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
const SCIMUserObject = require('./SCIMUserObject.json');
const SCIMGroupObject = require('./SCIMGroupObject.json')

const db = new sqlite3.Database('test.db'); 

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/**
 * Create new db and tables
 */

 function createDBandTables() {
    const createUserTable = 'CREATE TABLE Users ("id" primary key, \
    "externalId" VARCHAR(255), "userName" VARCHAR(255), \
    "nameFormatted" VARCHAR(255), "nameFamilyName" VARCHAR(255), \
    "nameGivenName" VARCHAR(255), nameMiddleName VARCHAR(255), \
    "nameHonorificPrefix" VARCHAR(255), "nameHonorificSuffix" VARCHAR(255), \
    "displayName" VARCHAR(255), "nickName" VARCHAR(255), "profileUrl" VARCHAR(255), \
    "userType"  VARCHAR(255), \
    "title" VARCHAR(255), "preferredLanguage" VARCHAR(255),  "locale" VARCHAR(255), \
    "timezone" VARCHAR(255), "active" boolean, "password" VARCHAR(255), \
    "metaResourceType" VARCHAR(255), \
    "metaCreated" VARCHAR(255), "metaLastModified" VARCHAR(255), "metaVersion" VARCHAR(255), \
    "metaLocation" VARCHAR(255))';

    const createGroupTable = 'CREATE TABLE Groups ("id" primary key, \
    "displayName" VARCHAR(255), "metaResourceType" VARCHAR(255), \
    "metaCreated" VARCHAR(255), "metaLastModified" VARCHAR(255), "metaVersion" VARCHAR(255), \
    "metaLocation" VARCHAR(255))';

    const createGroupMembersTable = 'CREATE TABLE GroupMembers ( "groupId" VARCHAR(255), value VARCHAR(255), \
    "$ref" VARCHAR(255), "display" VARCHAR(255))';

    db.run(createUserTable, function(err) {
      if(err !== null) { console.log(err); }
      else {
        console.log('successfully created new Users table');
        db.run(createGroupTable, function(err) {
          if (err !== null) { console.log(err); }
          
          else {
            console.log('successfully created new Groups table');
            db.run(createGroupMembersTable, function(err) {
              if (err !== null) { console.log(err); }
              
              else {
                console.log('successfully created new GroupMembers table');
              }
            });
          }
        });
      }
    });
 }

 function generateUserInsertQuery(userObject) {
  const userId = String(uuid.v1());
  const insertQueryFields = "INSERT INTO 'Users' ('id', \
  'externalId', 'userName', \
  'nameFormatted', 'nameFamilyName', \
  'nameGivenName', 'nameMiddleName', \
  'nameHonorificPrefix', 'nameHonorificSuffix', \
  'displayName', 'nickName', 'profileUrl', \
  'userType' , \
  'title', 'preferredLanguage',  'locale', \
  'timezone', 'active', 'password', \
  'metaResourceType', \
  'metaCreated', 'metaLastModified', 'metaVersion', \
  'metaLocation')";

  let insertQueryValues = " VALUES ('" + userId + "','" 
  + userObject.externalId + "','"
  + userObject.userName + "','"
  + userObject.name.formatted + "','"
  + userObject.name.familyName + "','" 
  + userObject.name.givenName + "','"
  + userObject.name.middleName + "','"
  + userObject.name.honorificPrefix + "','"
  + userObject.name.honorificSuffix + "','"
  + userObject.displayName + "','"
  + userObject.nickName + "','"
  + userObject.profileUrl + "','"
  + userObject.userType + "','"
  + userObject.title + "','"
  + userObject.preferredLanguage + "','"
  + userObject.locale + "','"
  + userObject.timezone + "','"
  + userObject.active + "','"
  + userObject.password + "','"
  + userObject.meta.resourceType + "','"
  + new Date() + "','"
  + new Date() + "','"
  + "W\/\"a330bc54f0671c9\"" + "','"
  + userObject.meta.location + "')";

  return insertQueryFields + insertQueryValues;
}

function generateUpdateUsersQuery(userObject, userId) {
  return "UPDATE 'Users' SET externalId = '" + String(userObject.externalId)
  + "', userName = '" + String(userObject.userName) + "', nameFormatted ='"
  + String(userObject.name.formatted) + "', nameFamilyName= '" + String(userObject.name.familyName)
  + "', nameGivenName ='" + String(userObject.name.givenName)
  + "', nameMiddleName ='" + String(userObject.name.middleName)
  + "', nameHonorificPrefix ='" + String(userObject.name.honorificPrefix)
  + "', nameHonorificSuffix ='" + String(userObject.name.honorificSuffix)
  + "', displayName ='" + String(userObject.displayName)
  + "', nickName ='" + String(userObject.nickName)
  + "', profileUrl ='" + String(userObject.profileUrl)
  + "', userType ='" + String(userObject.userType)
  + "', title ='" + String(userObject.title)
  + "', preferredLanguage ='" + String(userObject.preferredLanguage)
  + "', locale ='" + String(userObject.locale)
  + "', timezone ='" + String(userObject.timezone)
  + "', active ='" + String(userObject.active)
  + "', password ='" + String(userObject.password)
  + "', metaResourceType ='" + String(userObject.meta.resourceType)
  + "', metaCreated ='" + String(userObject.meta.created)
  + "', metaLastModified ='" + String(new Date())
  + "', metaVersion ='" + String("W\/\"a330bc54f0671c9\"")
  + "', metaLocation ='" + String(userObject.meta.location)
  + "' WHERE id = '" + userId + "'";
}
/* WIP
function generateGroupUpdateQuery(groupObject, groupId) {
  return "UPDATE 'Group' SET displayName = '" + String(groupObject.displayName)
  + "', metaResourceType = '" + String(groupObject.meta.resourceType)
  + "', metaCreated = '" + String(groupObject.userName)
  + "', metaCreated = '" + String(groupObject.userName)
  + "', metaCreated = '" + String(groupObject.userName)
  + "', metaCreated = '" + String(groupObject.userName)
  + "' WHERE id = '" + userId + "'";
}
*/
function generateGroupInsertQuery(groupObject, req_url) {
  const groupId = String(uuid.v1());
  const metaLocation = req_url + "/" + groupId;
  const insertGroupFields = "INSERT INTO 'Groups' ('id', \
  'displayName', 'metaResourceType', \
  'metaCreated', 'metaLastModified', 'metaVersion', \
  'metaLocation')";

  const insertGroupValues = " VALUES ('" + groupId + "','"
  + groupObject.displayName + "','"
  + groupObject.meta.resourceType + "','" 
  + new Date() + "','"
  + new Date() + "','"
  + "W\/\"3694e05e9dff592\"" + "','"
  + metaLocation + "')";

  return insertGroupFields + insertGroupValues;
}

/** 
 *   Constructor for creating SCIM Resource 
 */
function GetSCIMList(rows, startIndex, count, req_url, objectType) {
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
  let location = "";

  if (objectType === 'user') {
    for (let i = (startIndex-1); i < count; i++) {
      location =  req_url + "/" + rows[i]["id"];
      let userResource = GetSCIMUserResource(rows[i], location);
      resources.push(userResource);
      location = "";
    }
  }

  else if (objectType === 'group' ) {
    for (let i = (startIndex-1); i < count; i++) {
      location =  req_url + "/" + rows[i]["id"];
      const userResource = GetSCIMGroupResource(rows[i], location);
      //i have no idea why it is breaking here but
      //if i dont clone the userResource obj it is passed into the array by reference
      //and subsequently every obj in the array references the object returned in the final function call
      //it works without needing to be cloned above....
      const clone = {...userResource};
      resources.push(clone);
      location = "";
    }
  }
  
  scim_resource["Resources"] = resources;
  scim_resource["startIndex"] = startIndex;
  scim_resource["itemsPerPage"] = count;
  scim_resource["totalResults"] = count
  return scim_resource;
}

function GetSCIMUserResource(row, req_url) {
  
  let scim_user = SCIMUserObject;

  scim_user.id = row.id;
  scim_user.externalId = row.externalId; 
  scim_user.userName = row.userName;
  scim_user.name.formatted = row.nameFormatted; 
  scim_user.name.familyName = row.nameFamilyName;
  scim_user.name.givenName = row.nameGivenName;
  scim_user.name.middleName = row.nameMiddleName
  scim_user.name.honorificPrefix = row.nameHonorificPrefix
  scim_user.name.honorificSuffix = row.nameHonorificSuffix
  scim_user.displayName = row.displayName
  scim_user.nickName = row.nickName
  scim_user.profileUrl = row.profileUrl
  scim_user.userType = row.userType
  scim_user.title = row.title
  scim_user.preferredLanguage = row.preferredLanguage
  scim_user.locale = row.locale
  scim_user.timezone = row.timezone
  scim_user.active = row.active
  scim_user.password = row.password
  scim_user.meta.resourceType = row.metaResourceType
  scim_user.meta.created = row.metaCreated
  scim_user.meta.lastModified = row.metaLastModified
  scim_user.meta.version = row.metaVersion
  scim_user.meta.location = req_url;
   
  return scim_user;
}

function GetSCIMGroupResource(row, req_url) {
  let scim_group = SCIMGroupObject;

  scim_group.id = row.id;
  scim_group.displayName = row.displayName;
  scim_group.meta.resourceType = row.metaResourceType;
  scim_group.meta.created = row.metaCreated;
  scim_group.meta.lastModified = row.metaLastModified;
  scim_group.meta.version = row.metaVersion;
  scim_group.meta.location = req_url;
  
  return scim_group;
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
  const usernameQuery = "SELECT * FROM Users WHERE userName='" + req.body.userName + "'";
  db.get(usernameQuery, function(err, rows) {
    if (err) {
      const scim_error = SCIMError( String(err), "400");
      res.writeHead(400, {'Content-Type': 'text/plain'});
      res.end(JSON.stringify(scim_error));  
    }

    else {
      if (rows) {
        const scim_error = SCIMError( "Conflict - Resource Already Exists", "409");
        res.writeHead(409, {'Content-Type': 'text/plain'});
        res.end(JSON.stringify(scim_error));
      }
      //insert new user
      else {
        const query = generateUserInsertQuery(req.body);
        console.log(query);
        db.run(query, function(err) {
          if (err) {
            const scim_error = SCIMError( String(err), "400");
            res.writeHead(400, {'Content-Type': 'text/plain'});
            res.end(JSON.stringify(scim_error));
          }

          else {
            res.writeHead(201, {'Content-Type': 'text/json'});
            res.end(JSON.stringify('created'));
          }
        });
      }
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
      } 
      
      else {
          // If requested no. of users is less than all users
          if (rows.length < count) {
            count = rows.length
          }
          console.log(rows);
          const scimResource = GetSCIMList(rows,startIndex,count,req_url, 'user');
          res.writeHead(200, {'Content-Type': 'application/json'})
          res.end(JSON.stringify(scimResource))
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
        const scimUserResource = GetSCIMUserResource(rows, req_url);         
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
  console.log(req.body.userId);
  const queryById = "SELECT * FROM Users WHERE id='" + userId + "'";
  db.get(queryById, function(err, rows) {
    if (err) {
      const scim_error = SCIMError( String(err), "400");
      res.writeHead(400, {'Content-Type': 'text/plain'});
      res.end(JSON.stringify(scim_error));
    }

    else {
      if (rows) {
        const updateQuery = generateUpdateUsersQuery(req.body, userId);
        console.log(updateQuery);
        db.run(updateQuery, function(err) {
          if (err) {
            console.log(err);
          }

          else {
            console.log('just updated user');
          }
        });
      }

      else {
        const scim_error = SCIMError( "User Does Not Exist", "404");
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end(JSON.stringify(scim_error));
      }
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

app.post('/scim/v2/Groups', function(req, res) {
  const url_parts = url.parse(req.url, true);
  const req_url =  url_parts.pathname;

  const groupQuery = "SELECT * FROM Groups WHERE displayName='" + req.body.displayName + "'";
  db.get(groupQuery, function(err, rows) {
    if (err) {
      const scim_error = SCIMError( String(err), "400");
      res.writeHead(400, {'Content-Type': 'text/plain'});
      res.end(JSON.stringify(scim_error));  
    }

    else {
      if (rows) {
        const scim_error = SCIMError( "Conflict - Resource Already Exists", "409");
        res.writeHead(409, {'Content-Type': 'text/plain'});
        res.end(JSON.stringify(scim_error));
      }
      //insert new group
      else {
        const query = generateGroupInsertQuery(req.body, req_url);
        console.log(query);
        db.run(query, function(err) {
          if (err) {
            const scim_error = SCIMError( String(err), "400");
            res.writeHead(400, {'Content-Type': 'text/plain'});
            res.end(JSON.stringify(scim_error));
          }

          else {
            res.writeHead(201, {'Content-Type': 'text/json'});
            res.end(JSON.stringify('created'));
          }
        });
      }
    }
  });
});

app.get("/scim/v2/Groups", function (req, res) {
  const url_parts = url.parse(req.url, true);
  const query = url_parts.query;
  startIndex  = query["startIndex"];
  count = query["count"];
  filter = query["filter"];

  const req_url =  url_parts.pathname;
  const selectQuery = "SELECT * FROM Groups";
  let queryAtrribute = "";
  let queryValue = "";

  if (filter != undefined) {
    queryAtrribute = String(filter.split("eq")[0]).trim();
    queryValue = String(filter.split("eq")[1]).trim();
    selectQuery = "SELECT * FROM Groups " + queryAtrribute + " = " + queryValue;
  }

  db.all(selectQuery , function(err, rows) {
    if (err == null) {
      if (rows === undefined) {
        const scim_error = SCIMError( "Group Not Found", "404");
          res.writeHead(404, {'Content-Type': 'text/plain'});
          res.end(JSON.stringify(scim_error));
      } 
      
      else {
          // If requested no. of users is less than all users
          if (rows.length < count) {
            count = rows.length
          }
          const scimResource = GetSCIMList(rows,startIndex,count,req_url, 'group');
          res.writeHead(200, {'Content-Type': 'application/json'})
          res.end(JSON.stringify(scimResource))
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
 *  Update Group attributes via PUT
 */
/* WIP
app.put("/scim/v2/Groups/:groupId", function (req, res) {
	const groupId = req.params.groupId;
	const url_parts = url.parse(req.url, true);
  const req_url = url_parts.pathname;
  console.log(req.body.userId);
  const queryById = "SELECT * FROM Groups WHERE id='" + groupId + "'";
  db.get(queryById, function(err, rows) {
    if (err) {
      const scim_error = SCIMError( String(err), "400");
      res.writeHead(400, {'Content-Type': 'text/plain'});
      res.end(JSON.stringify(scim_error));
    }

    else {
      if (rows) {
        const updateQuery = generateUpdateUsersQuery(req.body, groupId);
        console.log(updateQuery);
        db.run(updateQuery, function(err) {
          if (err) {
            console.log(err);
          }

          else {
            console.log('just updated user');
          }
        });
      }

      else {
        const scim_error = SCIMError( "Group Does Not Exist", "404");
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end(JSON.stringify(scim_error));
      }
    }
  });
});
*/

/**
 *  Instantiates or connects to DB
 */
const server = app.listen(8081, function () {
  const databaseQuery = "SELECT name FROM sqlite_master WHERE type='table'";
  db.all(databaseQuery, function(err, rows) {
    if (err) {
      console.log(err); 
    }
    
    else if(rows.length === 0) {
      console.log('here');
      createDBandTables();
    }

    else {
      console.log(!!rows.length);
    }
  });
});