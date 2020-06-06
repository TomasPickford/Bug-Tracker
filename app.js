var express = require('express');
var app = express();

app.use(express.json());

app.use(express.static('client')); // host the webpage to avoid CORS errors

var fs = require('fs');

var reports = require('./reports.json');
var comments = require('./comments.json');
const statusNames = ['New', 'Requires Evidence', 'Pending Fixes', 'Fixed', 'Duplicate', 'Invalid']; // used to validate status searches or update requests

// search reports by status
app.get('/status', function (req, resp, next) {
    const search = req.query.search; // take the value of the search query from the URL
    const response = [];
    if (!(statusNames.indexOf(search) >= 0)) { // if the searched status is not one of the valid six
        resp.status(400); // Bad request error code
        resp.send('400 Error: "' + search + '" is not a valid status');
        return; // avoid doing resp.send() again
    }
    for (const report of reports) { // else if the searched status is valid
        if (report.status === search) {
            response.push(report); // add all reports with that status to the response
        }
    }
    resp.send(response);
});

// search reports by title
app.get('/titles', function (req, resp) {
    const keywords = req.query.search; // take the value of the search query from the URL
    if (typeof keywords === 'undefined') { // if they didn't specify the query at all
        resp.status(400); // Bad request error code
        resp.send('400 Error: No search query provided');
        return; // avoid doing resp.send() again
    }
    // all other searches are valid; if the user inputs a strange character, they will probably just get no results
    const response = [];
    for (const report of reports) {
        if (report.title.toLowerCase().includes(keywords.toLowerCase())) { // the matching is not case sensitive
            response.push(report); // add all reports with the keywords in their title to the response
        }
    }
    resp.send(response);
});

// get all data for a specified report
app.get('/report', function (req, resp) {
    const id = req.query.id; // take the value of the id query from the URL
    const intID = parseInt(id); // initially id is a string
    if (intID > 0 && intID <= reports.length) { // validation: if the ID is between 1 and the greatest current ID
        const response = reports[intID - 1]; // IDs start at 1 whereas indexing of the array starts at 0
        resp.send(response);
    } else {
        resp.status(400); // Bad request error code
        resp.send('400 Error: "' + id + '" does not match any report ID');
    }
});

// get the number of comments linked to a specified report
app.get('/countcomments', function (req, resp) {
    const id = req.query.reportid; // take the value of the id query from the URL
    const intID = parseInt(id); // initially id is a string
    const response = [];
    if (intID > 0 && intID <= reports.length) { // validation: if the ID is between 1 and the greatest current ID
        let count = 0;
        for (const i of comments) {
            if (i.bugID === id) { // if the comment shares the specified report ID
                count++;
            }
        }
        response.push(count); // just send the int in the JSON
        resp.send(response);
    } else { // if the ID is invalid (there's not matching report)
        resp.status(400); // Bad request error code
        resp.send('400 Error: "' + id + '" does not match any report ID');
    }
});

// get the time the most recent comment was added to the specified report
app.get('/lastcomment', function (req, resp) {
    const id = req.query.reportid; // take the value of the id query from the URL
    const intID = parseInt(id); // initially id is a string
    const response = [];
    if (intID > 0 && intID <= reports.length) { // validation: if the ID is between 1 and the greatest current ID
        let found = false; // then check if that report has any comments
        for (let i = comments.length - 1; i >= 0; i--) { // starts at the most recent comments
            if (comments[i].bugID === id) {
                response.push(comments[i].time); // the first comment for that bug it finds is also the most recent
                found = true;
                break; // it has already found the last comment so there is no need to iterate through the rest
            }
        }
        if (found === false) { // if there are no comments on the report
            response.push('None'); // the user can handle the report having no comments this way
        }
        resp.send(response);
    } else { // if the ID is invalid (there's not matching report)
        resp.status(400); // Bad request error code
        resp.send('400 Error: "' + id + '" does not match any report ID');
    }
});

// get all comment objects that match the requested report ID
app.get('/comments', function (req, resp) {
    const id = req.query.reportid; // take the value of the id query from the URL
    const intID = parseInt(id); // initially id is a string
    const response = [];
    if (intID > 0 && intID <= reports.length) { // validation: if the ID is between 1 and the greatest current ID
        for (const comment of comments) {
            if (comment.bugID === id) {
                response.push(comment); // add all comments for the specified report
            }
        }
        resp.send(response);
    } else { // if the ID is invalid (there's not matching report)
        resp.status(400); // Bad request error code
        resp.send('400 Error: "' + id + '" does not match any report ID');
    }
});

// post a new report
app.post('/create', function (req, resp) {
    const newReport = req.body; // accesses the body of the POST request
    newReport.id = reports.length + 1; // the report IDs start at 1 whereas the report array indexing starts at 0
    reports.push(newReport); // add the report to the array

    const json = JSON.stringify(reports); // convert the entire array of reports to JSON
    fs.writeFile('reports.json', json, 'utf8', console.log); // save the reports immediately in case the server is restarted
    resp.send(`Sent report with ID ${newReport.id}`); // send confirmation of success
});

// change the status of the specified report
app.post('/updatestatus', function (req, resp) {
    const data = req.body; // accesses the body of the POST request
    const id = parseInt(data.id); // extract the ID of the specified report
    const intID = parseInt(id); // initially id is a string
    if (intID > 0 && intID <= reports.length) { // validation: if the ID is between 1 and the greatest current ID
        if (statusNames.indexOf(data.status) >= 0) { // checking the status is one of the allowed six
            for (const report in reports) {
                if (reports[report].id === id) { // search for the report specified by the ID
                    reports[report].status = data.status; // update the status attribute of the report
                    break; // the correct report has been found so there is no need to iterate through the rest
                }
            }
            const json = JSON.stringify(reports); // convert the entire array of reports to JSON
            fs.writeFile('reports.json', json, 'utf8', console.log); // save the reports immediately in case the server is restarted
            resp.send(`Updated report with ID ${data.id}`); // send confirmation of success
        } else { // if it is an invalid status
            resp.status(400); // Bad request error code
            resp.send('400 Error: "' + data.status + '" is not a valid report status');
        }
    } else { // if it is an invalid ID
        resp.status(400); // Bad request error code
        resp.send('400 Error: "' + id + '" does not match any report ID');
    }
});

// create a new comment for the specified report
app.post('/comment', function (req, resp) {
    const newComment = req.body; // accesses the body of the POST request
    const intID = parseInt(newComment.bugID); // newComment.bugID is a string, which cannot be operated on mathematically
    if (intID > 0 && intID <= reports.length) { // validation: if the ID is between 1 and the greatest current ID
        newComment.time = new Date(); // the server decides the time to ensure consistency and chronology
        comments.push(newComment); // add the new comment to the array

        const json = JSON.stringify(comments); // convert the entire comments of reports to JSON
        fs.writeFile('comments.json', json, 'utf8', console.log); // save the comments immediately in case the server is restarted
        resp.send(`Posted comment on bug report ID ${newComment.bugID}`); // send confirmation of success
    } else { // if it is an invalid ID
        resp.status(400); // Bad request error code
        resp.send('400 Error: "' + intID + '" does not match any report ID');
    }
});

module.exports = app; // the server.js file imports this script to access its methods
