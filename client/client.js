var searchTitle = document.getElementById('searchTitle'); // this is the searchbar in the header used for searching through report titles

searchTitle.addEventListener('submit', searchByTitle); // when clicked on, call the searchByTitle function

// search reports by title from the form in the header
async function searchByTitle (event) {
    try {
        event.preventDefault(); // prevent a new webpage being loaded

        const keywords = document.getElementById('titleKeywords').value;

        /* send get request */

        const response = await fetch('http://127.0.0.1:8090/titles?search=' + keywords);

        const body = await response.text();

        const results = JSON.parse(body);
        // call table constructing function that's shared with the searchByStatus() function
        buildReportsTable(results);
    } catch (e) {
        alert('The server could not by reached. Try again later. Error: ' + e); // handles server disconnection
    }
}

// search reports by status by clicking on the links in the header
async function searchByStatus (status) {
    try {
        /* send get request */

        const response = await fetch('http://127.0.0.1:8090/status?search=' + status);

        const body = await response.text();

        const results = JSON.parse(body);
        // call table constructing function that's shared with the searchByTitle() function
        buildReportsTable(results);
    } catch (e) {
        alert('The server could not by reached. Try again later. Error: ' + e); // handles server disconnection
    }
}

// get the details of a specific report after clicking on its title listed in a search
async function getReport (id) {
    try {
        /* send get request */

        const response = await fetch('http://127.0.0.1:8090/report?id=' + id);

        const body = await response.text();

        const results = JSON.parse(body);

        buildView(results); // builds the elements to contain the details of the report, as well as buttons for commenting on or categorising the report
    } catch (e) {
        alert('The server could not by reached. Try again later. Error: ' + e); // handles server disconnection
    }
}

// get the integer of the number of comments for the specified report, to be displayed in the comment info box under the report details
async function countComments (id) {
    try {
        /* send get request */

        const response = await fetch('http://127.0.0.1:8090/countcomments?reportid=' + id);

        const body = await response.text();

        const results = JSON.parse(body);

        return results;
    } catch (e) {
        alert('The server could not by reached. Try again later. Error: ' + e); // handles server disconnection
    }
}

// get the time the last comment was posted for the specified report, to be displayed in the comment info box under the report details
async function getLastCommentDate (id) {
    try {
        /* send get request */

        const response = await fetch('http://127.0.0.1:8090/lastcomment?reportid=' + id);

        const body = await response.text();

        const results = JSON.parse(body);

        return results;
    } catch (e) {
        alert('The server could not by reached. Try again later. Error: ' + e); // handles server disconnection
    }
}

// get a list of comments for the specified report
async function getComments (id) {
    try {
        /* send get request */

        const response = await fetch('http://127.0.0.1:8090/comments?reportid=' + id);

        const body = await response.text();

        const results = JSON.parse(body);

        buildCommentsTable(results); // call the table constructing function for displaying comments and their sent times
    } catch (e) {
        alert('The server could not by reached. Try again later. Error: ' + e); // handles server disconnection
    }
}

// POST REQUESTS

async function postReport (event) {
    try {
        event.preventDefault(); // prevent a new webpage being loaded

        const status = 'New'; // this is a placeholder as the server always sets the status to 'New'
        const title = document.getElementById('reportTitle').value;
        const description = document.getElementById('reportDescription').value;
        const id = null; // this is a placeholder as the server calculates the next available ID
        const data = { status, title, description, id };

        // send post request

        await fetch('http://127.0.0.1:8090/create',
            {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        searchByStatus('New'); // after posting the report, display all the new reports so that the user may view their new post
    } catch (e) {
        alert('The server could not by reached. Your report has not been sent. Try again later. Error: ' + e); // handles server disconnection
    }
}

// change the status of the specified report
async function postStatus (event) {
    try {
        event.preventDefault(); // prevent a new webpage being loaded

        const form = document.getElementById('statusRadio');

        const id = form.getAttribute('reportID');

        const options = document.getElementsByName('options');

        var found = false;
        for (const i in options) { // look through all 6 possible status options the user could have clicked on
            if (options[i].checked) { // if one is selected
                var status = options[i].value; // this will be the report's new status
                found = true;
                break; // there is no need to iterate through the remaining buttons
            }
        }
        if (found === false) {
            return; // if the user didn't select a status, don't do anything, giving them the chance to select one
        }

        const data = { id, status };
        // send post request

        await fetch('http://127.0.0.1:8090/updatestatus',
            {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        getReport(id); // after updating the status, reload the report viewer to reflect the change
    } catch (e) {
        alert('The server could not by reached. The status has not been updated. Try again later. Error: ' + e); // handles server disconnection
    }
}

async function postComment (event) {
    try {
        event.preventDefault(); // prevent a new webpage being loaded
        const submitButton = document.getElementById('submitButton');
        const bugID = submitButton.getAttribute('reportID');
        const text = document.getElementById('commentInput').value;
        const time = null; // the server will decide the time
        const data = { bugID, text, time };

        // send post request

        await fetch('http://127.0.0.1:8090/comment',
            {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        getReport(bugID); // after sending the comment, the comment info box needs to be updated
        getComments(bugID); // list all the comments to show the new comment posted
    } catch (e) {
        alert('The server could not by reached. Your comment has not been sent. Try again later. Error: ' + e); // handles server disconnection
    }
}

// when changing between interfaces, the previous content needs to be removed
function clearElements () {
    document.getElementById('welcomeDiv').innerHTML = '';
    document.getElementById('welcomeDiv').removeAttribute('class');
    document.getElementById('creatorDiv').innerHTML = '';
    document.getElementById('resultsDiv').innerHTML = '';
    document.getElementById('viewDiv').innerHTML = '';
    clearAmendDivs();
}

/* when changing between viewing comments, writing a comment and changing the report's status,
   the previously displayed interface must be removed without removing the entire report viewer. */
function clearAmendDivs () {
    document.getElementById('commentsDiv').innerHTML = '';
    document.getElementById('replyDiv').innerHTML = '';
    document.getElementById('statusDiv').innerHTML = '';
}

// construct the welcome message after clicking on the "Bug Tracker" brand link
/* eslint-disable no-unused-vars */
function buildWelcome () { // this function is only referenced by index.HTML so eslint incorrectly raises an error that it is never used
    /* eslint-enable no-unused-vars */
    clearElements(); // when changing between interfaces, the previous content needs to be removed
    const parent = document.getElementById('welcomeDiv');
    parent.setAttribute('class', 'welcome-message');
    const heading = document.createElement('h1');
    let text = document.createTextNode('Welcome to the Bug Tracker');
    heading.appendChild(text);
    parent.appendChild(heading);

    const para = document.createElement('p');
    para.setAttribute('class', 'lead');
    text = document.createTextNode('Create, edit and close bug reports on this website. Sort reports by status or search for keywords in titles.');
    para.appendChild(text);
    parent.appendChild(para);
}

// construct the report editor after clicking on "Create Report"
/* eslint-disable no-unused-vars */
function buildCreator () { // this function is only referenced by index.HTML so eslint incorrectly raises an error that it is never used
    /* eslint-enable no-unused-vars */
    clearElements(); // when changing between interfaces, the previous content needs to be removed
    var parent = document.getElementById('creatorDiv');

    const heading = document.createElement('h1');
    heading.innerHTML = 'Create a new Bug Report';
    parent.appendChild(heading);

    const creatorForm = document.createElement('form');
    creatorForm.setAttribute('id', 'creatorForm');
    creatorForm.addEventListener('submit', postReport);

    const titleLabel = document.createElement('label');
    titleLabel.setAttribute('for', 'reportTitle');
    titleLabel.innerHTML = 'Report Title';

    const reportTitle = document.createElement('input');
    reportTitle.setAttribute('class', 'form-control');
    reportTitle.setAttribute('type', 'text');
    reportTitle.setAttribute('placeholder', 'Use keywords to aid searches');
    reportTitle.setAttribute('id', 'reportTitle');

    const descriptionLabel = document.createElement('label');
    descriptionLabel.setAttribute('for', 'reportDescription');
    descriptionLabel.innerHTML = 'Description';

    const reportDescription = document.createElement('textarea');
    reportDescription.setAttribute('class', 'form-control');
    reportDescription.setAttribute('rows', '5');
    reportDescription.setAttribute('placeholder', 'Enter a description of the bug, plus any output logs or links to evidence');
    reportDescription.setAttribute('id', 'reportDescription');

    const lineBreak = document.createElement('br');

    const submitButton = document.createElement('button');
    submitButton.setAttribute('class', 'btn btn-success');
    submitButton.setAttribute('type', 'submit');
    submitButton.innerHTML = 'Publish Report';

    // then append everything to parent
    creatorForm.appendChild(titleLabel);
    creatorForm.appendChild(reportTitle);
    creatorForm.appendChild(descriptionLabel);
    creatorForm.appendChild(reportDescription);
    creatorForm.appendChild(lineBreak);
    creatorForm.appendChild(submitButton);
    parent.appendChild(creatorForm);
}

// constructs a table for viewing report statuses and titles returned by searching through either attribute
function buildReportsTable (results) {
    // my table building function is a close adaptation of the code at https://www.valentinog.com/blog/html-table/
    clearElements(); // when changing between interfaces, the previous content needs to be removed

    var table = document.createElement('table');
    var parent = document.getElementById('resultsDiv');
    parent.appendChild(table);
    table.setAttribute('class', 'table');
    for (const report of results) {
        const row = table.insertRow();
        row.insertCell().appendChild(document.createTextNode(report.status));
        const link = document.createElement('a');
        link.setAttribute('href', '#');
        link.setAttribute('onclick', 'getReport(' + report.id + ')');
        link.innerHTML = report.title;
        row.insertCell().appendChild(link);
    }

    var header = table.createTHead();
    var topRow = header.insertRow();
    var text = document.createTextNode('Status');
    var th = document.createElement('th');
    th.appendChild(text);
    topRow.appendChild(th);
    text = document.createTextNode('Title');
    th = document.createElement('th');
    th.appendChild(text);
    topRow.appendChild(th);
}

// build the interface for viewing all the details of a single report
function buildView (data) {
    clearElements(); // when changing between interfaces, the previous content needs to be removed
    const parent = document.getElementById('viewDiv');
    const reportTitle = document.createElement('h2');
    reportTitle.innerHTML = data.title;
    const reportStatus = document.createElement('h4');
    reportStatus.innerHTML = 'Status: ' + data.status;
    const reportDescription = document.createElement('p');
    reportDescription.innerHTML = data.description;

    const commentInfo = document.createElement('div');
    commentInfo.setAttribute('class', 'alert alert-info');
    commentInfo.setAttribute('id', 'commentInfo');
    commentInfo.setAttribute('role', 'alert');
    commentInfo.innerHTML = 'Searching for comments...';

    const id = data.id; // the ID of the currently viewed report must be accessible to the buttons that will send requests for the specific report

    const commentsButton = document.createElement('button');
    commentsButton.setAttribute('class', 'btn btn-secondary');
    commentsButton.setAttribute('type', 'button');
    commentsButton.setAttribute('onclick', 'getComments(' + id + ')'); // gets a list of all comments for that report
    commentsButton.innerHTML = 'View Comments';

    const replyButton = document.createElement('button');
    replyButton.setAttribute('class', 'btn btn-secondary');
    replyButton.setAttribute('type', 'button');
    replyButton.setAttribute('onclick', 'buildReply(' + id + ')'); // constructs the interface for writing a comment
    replyButton.innerHTML = 'Write Comment';

    const statusButton = document.createElement('button');
    statusButton.setAttribute('class', 'btn btn-secondary');
    statusButton.setAttribute('type', 'button');
    statusButton.setAttribute('onclick', 'buildStatus(' + id + ')'); // constructs the interface for updating the report's status
    statusButton.innerHTML = 'Change Status';

    parent.appendChild(reportTitle);
    parent.appendChild(reportStatus);
    parent.appendChild(reportDescription);
    parent.appendChild(commentInfo);
    parent.appendChild(commentsButton);
    parent.appendChild(replyButton);
    parent.appendChild(statusButton);

    updateCommentInfo(id); // fill the comments info box
}

// provides the text for the comments info box, which specifies the number of comments and date of the most recent one
async function updateCommentInfo (id) { // the function is asynchronus as it must wait for GET requests to be fulfilled before using that data
    try {
        const nComments = await countComments(id); // get the number of comments for the currently viewed report
        let lastDate = await getLastCommentDate(id); // get the last date of a
        lastDate = new Date(lastDate); // convert the string to a Date object
        lastDate = lastDate.toLocaleString(); // convert this Date object to a human-readable string
        let countString = '';
        let dateString = lastDate;
        if (nComments[0] === 0) {
            countString = 'There are no comments yet.';
            dateString = ''; // There is no last comment so obviously no corresponding time
        } else if (nComments[0] === 1) {
            countString = 'There is 1 comment.';
            dateString = ' It was posted at ' + dateString + '.';
        } else {
            countString = 'There are ' + nComments + ' comments.';
            dateString = ' The last comment was posted at ' + dateString + '.';
        }
        document.getElementById('commentInfo').innerHTML = countString + dateString;
    } catch (e) {
         // handles server disconnection
        document.getElementById('commentInfo').innerHTML = 'There was an issue collecting information on comments. Please try again later. Error: ' + e;
    }
}

// constructs a table to display the comments and the times they were sent, of the currently viewed report
function buildCommentsTable (results) {
    // my table building function is a close adaptation of the code at https://www.valentinog.com/blog/html-table/
    clearAmendDivs(); // remove the "write comment" or "change status" inferfaces

    var table = document.createElement('table');
    var parent = document.getElementById('commentsDiv');
    parent.appendChild(table);
    table.setAttribute('class', 'table');
    for (const comment of results) {
        const row = table.insertRow(0); // add later comments to the top of the list
        row.insertCell().appendChild(document.createTextNode(comment.text));
        let date = new Date(comment.time);
        date = date.toLocaleString();
        row.insertCell().appendChild(document.createTextNode(date));
    }

    var header = table.createTHead();
    var topRow = header.insertRow();

    let text = document.createTextNode('Comment');
    let th = document.createElement('th');
    th.appendChild(text);
    topRow.appendChild(th);
    text = document.createTextNode('Date');
    th = document.createElement('th');
    th.appendChild(text);
    topRow.appendChild(th);
}

// adds a text form and button to send a comment that will be linked to the currently viewed report
/* eslint-disable no-unused-vars */
function buildReply (id) { // this function is only referenced by index.HTML so eslint incorrectly raises an error that it is never used
    /* eslint-enable no-unused-vars */
    clearAmendDivs(); // remove the "view comments" or "change status" inferfaces

    var parent = document.getElementById('replyDiv');

    const creatorForm = document.createElement('form');
    creatorForm.setAttribute('id', 'creatorForm');
    creatorForm.addEventListener('submit', postComment);

    const commentInput = document.createElement('textarea');
    commentInput.setAttribute('class', 'form-control');
    commentInput.setAttribute('rows', '3');
    commentInput.setAttribute('placeholder', 'Enter your comment here');
    commentInput.setAttribute('id', 'commentInput');

    const lineBreak = document.createElement('br');

    const submitButton = document.createElement('button');
    submitButton.setAttribute('class', 'btn btn-success');
    submitButton.setAttribute('type', 'submit');
    submitButton.setAttribute('id', 'submitButton');
    submitButton.setAttribute('reportID', id);
    submitButton.innerHTML = 'Post Comment';
    // then append everything to parent

    creatorForm.appendChild(commentInput);
    creatorForm.appendChild(lineBreak);
    creatorForm.appendChild(submitButton);
    parent.appendChild(creatorForm);
}

// adds buttons to select the new status for the currently viewed report
/* eslint-disable no-unused-vars */
function buildStatus (id) { // this function is only referenced by index.HTML so eslint incorrectly raises an error that it is never used
    /* eslint-enable no-unused-vars */
    clearAmendDivs(); // remove the "view comments" or "write comment" inferfaces

    const parent = document.getElementById('statusDiv');
    parent.appendChild(document.createElement('br'));
    const statusRadio = document.createElement('form');
    statusRadio.setAttribute('id', 'statusRadio');
    statusRadio.addEventListener('submit', postStatus);
    statusRadio.setAttribute('reportID', id);
    const radioDiv = document.createElement('div');
    radioDiv.setAttribute('class', 'btn-group btn-group-toggle');
    radioDiv.setAttribute('data-toggle', 'buttons');
    const statusNames = ['New', 'Requires Evidence', 'Pending Fixes', 'Fixed', 'Duplicate', 'Invalid'];
    for (const name of statusNames) { // the only differences between buttons are their displayed text (innerHTML) and value, so they are generated in a loop
        const label = document.createElement('label');
        label.setAttribute('class', 'btn btn-secondary');
        const option = document.createElement('input');
        option.setAttribute('type', 'radio');
        option.setAttribute('name', 'options');
        option.setAttribute('value', name); // the value of the checked button is read by postStatus() to be sent in a POST request
        label.innerHTML = name; // the visible text on the buttons
        label.appendChild(option);
        radioDiv.appendChild(label);
    }
    const submitButton = document.createElement('button');
    submitButton.setAttribute('type', 'submit');
    submitButton.setAttribute('class', 'btn btn-primary');
    submitButton.innerHTML = 'Update Status';
    statusRadio.appendChild(radioDiv);
    statusRadio.appendChild(submitButton);
    parent.appendChild(statusRadio);
}
