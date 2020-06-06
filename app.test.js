
'use strict';

const request = require('supertest');
const app = require('./app');

describe('Test the bug report and comment services', () => {
    // Bug Report GET services

    test('GET /status succeeds for a valid search ("New")', () => {
        return request(app)
            .get('/status?search=New')
            .expect(200);
    });

    test('GET /status fails for an invalid search (an empty string)', () => {
        return request(app)
            .get('/status?search=')
            .expect(400);
    });

    test('GET /status fails for an miscapitalised search', () => {
        return request(app)
            .get('/status?search=new')
            .expect(400);
    });

    test('GET /status returns JSON for a valid search ("New")', () => {
        return request(app)
            .get('/status?search=New')
            .expect('Content-type', /json/);
    });

    test('GET /status returns reports with the search as their status', () => {
        return request(app)
            .get('/status?search=Requires Evidence')
            .expect(/Requires Evidence/); // this is a regular expression
    });

    test('GET /titles succeeds', () => {
        return request(app)
            .get('/titles?search=')
            .expect(200);
    });

    test('GET /titles returns JSON', () => {
        return request(app)
            .get('/titles?search=')
            .expect('Content-type', /json/);
    });

    test('GET /titles returns reports that include the search term', () => {
        return request(app)
            .get('/status?search=bug')
            .expect(/bug/); // this is a regular expression
    });

    test('GET /report succeeds with a valid report ID (1)', () => {
        return request(app)
            .get('/report?id=1')
            .expect(200);
    });

    test('GET /report fails with an invalid report ID (0)', () => {
        return request(app)
            .get('/report?id=0')
            .expect(400);
    });

    test('GET /report returns JSON for a valid report ID (1)', () => {
        return request(app)
            .get('/report?id=1')
            .expect('Content-type', /json/);
    });

    test('GET /report returns the description for a valid bug ID (1)', () => {
        return request(app)
            .get('/report?id=1')
            .expect(/description/); // "description" declares that attribute of the report object
    });

    // Bug Report POST services

    test('POST /create succeeds', () => {
        const params = {
            status: 'New',
            title: 'Test POST /create works',
            description: 'Description here',
            id: null
        };

        return request(app)
            .post('/create')
            .send(params)
            .expect(200);
    });

    test('POST /create adds new report to be accessed via GET', async () => {
        const params = {
            status: 'New',
            title: 'Unique Title 785642',
            description: '',
            id: null
        };

        await request(app)
            .post('/create')
            .send(params);

        return request(app)
            .get('/titles?search=Unique Title 785642')
            .expect(/Unique Title 785642/);
    });

    test('POST /updatestatus succeeds', () => {
        const params = {
            id: '1',
            status: 'Invalid'
        };

        return request(app)
            .post('/updatestatus')
            .send(params)
            .expect(200);
    });

    test('POST /updatestatus fails for invalid report ID (0)', () => {
        const params = {
            id: '0',
            status: 'Invalid'
        };

        return request(app)
            .post('/updatestatus')
            .send(params)
            .expect(400);
    });

    test('POST /updatestatus fails for invalid status (an empty string)', () => {
        const params = {
            id: '1',
            status: ''
        };

        return request(app)
            .post('/updatestatus')
            .send(params)
            .expect(400);
    });

    test('POST /updatestatus changes data to be accessed via GET', async () => {
        /*
         * Because the earlier test changes the first report's status to 'Invalid', this test
         * will never incorrectly return success as it would otherwise do if the report's
         * status was initially 'Fixed' and the /updatestatus method wasn't working.
        */
        const params = {
            id: '1',
            status: 'Fixed'
        };
        await request(app)
            .post('/updatestatus')
            .send(params);
        return request(app)
            .get('/report?id=1')
            .expect(/"status":"Fixed"/);
    });

    // Comment GET Services

    test('GET /comments succeeds for a valid bug report ID (1)', () => {
        return request(app)
            .get('/comments?reportid=1')
            .expect(200);
    });

    test('GET /comments fails for an invalid bug report ID (0)', () => {
        return request(app)
            .get('/comments?reportid=0')
            .expect(400);
    });

    test('GET /comments fails when the reportid query is not specified', () => {
        return request(app)
            .get('/comments')
            .expect(400);
    });

    test('GET /comments returns JSON for a valid report ID (1)', () => {
        return request(app)
            .get('/comments?reportid=1')
            .expect('Content-type', /json/);
    });

    test('GET /comments returns the text of a comment for a valid report ID (1)', () => {
        return request(app)
            .get('/comments?reportid=1')
            .expect(/text/); // "text" declares that attribute of the comment object
    });

    test('GET /countcomments succeeds for a valid bug report ID (1)', () => {
        return request(app)
            .get('/countcomments?reportid=1')
            .expect(200);
    });

    test('GET /countcomments fails for an invalid bug report ID (0)', () => {
        return request(app)
            .get('/countcomments?reportid=0')
            .expect(400);
    });

    test('GET /comments returns JSON for a valid bug report ID (1)', () => {
        return request(app)
            .get('/comments?reportid=1')
            .expect('Content-type', /json/);
    });

    test('GET /lastcomment succeeds for a valid bug report ID (1)', () => {
        return request(app)
            .get('/lastcomment?reportid=1')
            .expect(200);
    });

    test('GET /lastcomment fails for an invalid bug report ID (0)', () => {
        return request(app)
            .get('/lastcomment?reportid=0')
            .expect(400);
    });

    test('GET /lastcomment returns JSON for a valid report ID (1)', () => {
        return request(app)
            .get('/comments?reportid=1')
            .expect('Content-type', /json/);
    });

    // Comment POST Services

    test('POST /comment succeeds', () => {
        const params = {
            bugID: '1',
            text: 'Comment body',
            time: null
        };

        return request(app)
            .post('/comment')
            .send(params)
            .expect(200);
    });

    test('POST /comment fails for invalid report ID (0)', () => {
        const params = {
            bugID: '0',
            text: 'Comment body',
            time: null
        };

        return request(app)
            .post('/comment')
            .send(params)
            .expect(400);
    });

    test('POST /comment adds new comment to be accessed via GET', async () => {
        const params = {
            bugID: '1',
            text: 'Unique Comment 429752',
            time: null
        };

        await request(app)
            .post('/comment')
            .send(params);

        return request(app)
            .get('/comments?reportid=1')
            .expect(/Unique Comment 429752/);
    });

    // Other Tests

    test('An invalid endpoint fails and throws a Not Found error', () => {
        return request(app)
            .get('/random')
            .expect(404); // not found error
    });
});
