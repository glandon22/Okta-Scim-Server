# Okta-Scim-Server
Sample SCIM server written in Node.js. It can be used with SCIM app in Okta for getting SCIM messages related to user provisioning. It supports following Users endpoints

1) Create User (POST to {SCIM Base Url}/User)


2) Get Users (GET to {SCIM Base Url}/User)


3) Get User By Id (POST to {SCIM Base Url}/User/:UserId)


4) Modify/Update User (PUT to SCIM Base Url}/User/:UserId)

# Installation
Download and run "npm install"

# Running and Testing the Server
Once all above is install run the node server "npm start". Make the following cals from any REST Client (Postman, cURL etc,) or API validation tools Runscope. 

1) POST {SCIM_Base_Url}/scim/v2/Users
```json
{"schemas":["urn:ietf:params:scim:schemas:core:2.0:User"],"id":"74c52bf3-d004-4abb-980d-7fe5a9706848","externalId":"777","userName":"gwright","name":{"formatted":null,"familyName":"g","givenName":"w","middleName":"l","honorificPrefix":"mr","honorificSuffix":null},"displayName":"landolf","nickName":"lou","profileUrl":null,"emails":[{"value":"","type":"","primary":true}],"addresses":[{"type":"","streetAddress":"","locality":"","region":"","postalCode":"","country":"","formatted":"","primary":true}],"phoneNumbers":[{"value":"","type":""}],"photos":[{"value":"","type":"photo"}],"userType":"Admin","title":"savant","preferredLanguage":"en-US","locale":"en-US","timezone":"America/New_York","active":true,"password":"gogators","groups":[{"value":"","$ref":"","display":""}],"x509Certificates":[{"value":""}],"meta":{"resourceType":"User","created":"today","lastModified":"yesterday","version":"W\/\"a330bc54f0671c9\"","location":"https://example.com/v2/Users/2819c223-7f76-453a-919d-413861904646"}}
```

2) GET {SCIM_Base_Url}/scim/v2/Users?count=2&startIndex=1

3) GET {SCIM_Base_Url}/scim/v2/Users?count=1&filter=gwright eq "gwright"&startIndex=1

4) PUT {SCIM_Base_Url}/scim/v2/Users/<UserID>

```json
{"schemas":["urn:ietf:params:scim:schemas:core:2.0:User"],"id":"74c52bf3-d004-4abb-980d-7fe5a9706848","externalId":"787","userName":"gwright1","name":{"formatted":null,"familyName":"gg","givenName":"wq","middleName":"lq","honorificPrefix":"mar","honorificSuffix":null},"displayName":"lando","nickName":"louby","profileUrl":null,"emails":[{"value":"","type":"","primary":true}],"addresses":[{"type":"","streetAddress":"","locality":"","region":"","postalCode":"","country":"","formatted":"","primary":true}],"phoneNumbers":[{"value":"","type":""}],"photos":[{"value":"","type":"photo"}],"userType":"SuperADMIN","title":"genius","preferredLanguage":"en-US","locale":"en-US","timezone":"America/New_York","active":true,"password":"gogators","groups":[{"value":"","$ref":"","display":""}],"x509Certificates":[{"value":""}],"meta":{"resourceType":"User","created":"today","lastModified":"yesterday","version":"W\/\"a330bc54f0671c9\"","location":"https://example.com/v2/Users/2819c223-7f76-453a-919d-413861904646"}}
  ```
5) DELETE {SCIM_Base_Url}/scim/v2/Users/:userID