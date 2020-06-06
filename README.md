# Bug-Tracker
API for bug tracking with web client

**See a quick demo of the client communicating with the API at https://youtu.be/8Nxcg57dayc**

# Server
See the API documentation at https://documenter.getpostman.com/view/11317683/Szme3xGq

To install the dependencies, type 'npm install'.  
ESlint and Jest tests are run with 'npm test'.  
Start the server with 'npm start'.  
The API is hosted on port 8090 by default, as is the web app after starting the server.  

# Client
The client is a single page web app and has the following features:
- Bug report creation (including title and text description)
- Categorise reports with 6 statuses: New, Requires Evidence, Pending Fixes, Fixed, Duplicate, Invalid
- Search through reports by title or status
- Comment on reports
- View comments in chronological order
