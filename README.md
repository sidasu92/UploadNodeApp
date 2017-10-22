# UploadeNodeApp
File Storage Node Application

## Synopsis 
This is a RESTful NodeJS application used to upload files which get stored in the sharded clusters of the MongoDB along with file sharing mechanism addressing all the 5 features of cloud computing.

## Code Example 
Front End Application will help the user to upload files in the cloud storage and also provides the file sharing feature. It addresses on demand feature, broad network access as we have published our application on to Heroku. The uploaded Files of the user are distributed across the clusters and are pulled when user downloads the file. This addresses the resource pooling feature. Distribution of files is implemented on the sharded clusters showing the scalability and elasticity features of the cloud. Admin will be prompted with an alert to add a new shard as soon as the max limit of the existing shards is reached.

## Motivation 
To address the below problems, we had come up with this implementation 
-	Creating and maintaining a local storage is expensive. - MongoDB On Cloud 
-	Inability to access data from any location in the world. - File Sharing Feature 
-	Cost factor; If a user needs more space, he/she has to buy more hardware. - Admin Adds Shard in the cloud cluster. 
-	On-site disaster can destroy the local back-ups.- Replica sets of the Shard 
-	Whenever data needs updating, backups also need to be updated. This is a time-consuming task. -MongoDB Uses HeartBeat And Election Protocol 
-	External hardware is required to share data. - File Sharing On Cloud 
-	Data on local storage is not protected. Ex. Physical theft of the local device will result in loss of data.- Data is stored on cloud and Authenticated using Passport feature of NodeJs

## Installation 
1. Install NodeJs on the target system 
2. Install NPM on the target system 
3. Set up the MongoDB 
  a. create a data directory, which is where the configuration server will store the metadata that associates location and content: 
     mkdir /mongo-metadata 
  b. start the configuration server with the following command: 
     mongod --configsvr --dbpath /mongo-metadata --port 27017 
  c. stop the mongodb process on this instance if it is already running. The query routers use data locks that conflict with the main        MongoDB process: service mongodb stop 
  d. the query router service is started with a string like this: 
     mongos --configdb 192.168.1.5:27017 
4. Download and extract the contents of the UploadNodeApp 
5. Navigate to the folder containing index.js 
6. In the terminal, hit command "npm install" 
7. Run mongod in a separate terminal by running "mongod" command 
8. Run mongo command line interface in a separate terminal by running "mongo" command 
9. In a separate terminal run "node index.js" 
10. On a web browser, hit localhost:3032
11. Alternatively, the node application could be accessed from Heroku app.

## API Reference

1. /login 
-Request Type: POST 
-Description: Shows the login page UI, takes username and password as input and sends data for passport authentication 
2. / 
-Request Type: POST 
-Description: After login, this shows the Upload files UI, this takes files as input and uploads them to the MongoDB. User can also navigate to the all files UI from this screen 
3. /files/:filename 
-Request Type: GET 
-Description: Takes filename as the input and retieves the file, if found in the mongodb database. 
4. /uploaded/:id 
-Request Type: GET 
-Description: Takes the filename as parameter and shows the particular file, if found in database. 
5. /delete/:filename 
-Request Type: GET 
-Description: Takes the filename as parameter and deletes, if found in database. 
6. /share/:filename 
-Request Type: GET 
-Description: Takes the filename as the parameter, username field is retrieved from the request parameter, which is sent from the frontend 
7. /allFiles 
-Request Type: GET 
-Description: Shows all the files currently shared with the logged in user. 
8. /logout 
-Request Type: POST 
-Description: Logs out the user of the system. 

## Modifications
1. UploadNodeApp has routes folder to route the traffic based on the URl. CloudStorage.js file in the routes folder has all the rest API endpoints. 
2. Model folder has user.js which has schema of the user. Mongoose is used to retrieve the schema. 
3. Views Folder has all the view pages such as login, error, success, allfiles, index.
