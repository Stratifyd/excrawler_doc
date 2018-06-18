require("babel-register");

const express = require('express')
const app = express();
var bodyParser = require('body-parser');

import { findTask, createTask } from './task';
import DemoCrawler from './demoCrawler';

var PORT = process.env.PORT || 3333;

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({type: "application/json"}));
app.use(bodyParser.text({ type: 'application/x-ndjson' }))

// error handler
app.use(function (err, req, res, next) {
	console.error(err.stack)
	res.status(500).json({
		success: false,
		messages: [err.message]
	})
})

app.get('/', (req, res) => {
	// return the read me
	var path = require('path');
	var filepath = path.join(__dirname, './welcome.html');
	res.sendFile(filepath);
})

app.get('/shutdown', (reg,res) => {
	res.send('<h1>The Tester is Shutdown</h1>');
	shutdown();
});



app.post('/run', (req, res) => {
	// start a test
	// res.send('Hello World!')
	console.log('Start a New Testing');

	var body = req.body;
	var { external, config } = body;
	// external contains the crawler registration
	var endpoint = `${req.protocol}://${req.hostname}:${PORT}/backend`;
	var task = createTask( external, endpoint );
	var ret = task.start( config );
	
	res.json({ success: true, payload: ret, version: 0});

})

app.get('/demo', (req,res) => {

	// run start a test for demo crawler
	var external = {
		meta: {
			name: 'External Crawler Demo'
		},
		credential: 'ignore',
		parameters: [
			{
				name: 'limit',
				req: true,
				type: "integer",
				min: 100,
				max: 99999,
			}
		],
		docIdField: 'docId',
		endpoint: `${req.protocol}://${req.hostname}:${PORT}/crawler`,
		analysis: {
			/* put a sample config here */
		},
		schema: {
			title: 'External Crawler Demo Doc Schema',
			"type": "object",
			"properties": {
				"docId": {
					"type": "number"
				},
				"text": {
					"type": "string"
				},
				"time" : {
					"type": "string"
				}
			},
			"required": ["docId", "text", "time"]
		}
	};
	var config = {
		params: {
			limit: 200
		}
	}

	var endpoint = `${req.protocol}://${req.hostname}:${PORT}/backend`;
	var task = createTask( external, endpoint );
	var ret = task.start( config );
	
	res.json({ success: true, payload: ret, version: 0});

})

// this simulate a external crawler
var crawler = express.Router()

// start a demo crawler
// the demo crawler will call upload twice and then close the task
crawler.post('/task', (req, res)=>{

	console.log('Start the demo crawler');

	var config = req.body;
	var c = new DemoCrawler(config);
	var ret = c.start();
	
	if( ret ) {
		res.json({success: true, payload:ret, version:0});
	}

});

app.use('/crawler',crawler);

// this simulate the Straifyd backend
var backend = express.Router();

// locate the task
backend.param('taskId', (req, res, next, taskId ) => {
	var task = findTask(taskId);
	if( task ) {
		req.task = task;
		next();
	} else {
		next(new Error('failed to find the task '+ taskId));
	}
});

backend.get('/log/:taskId', (req, res, next ) => {
	res.sendFile(req.task.logFilePath);
});

backend.get('/output/:taskId', (req, res, next ) => {
	res.sendFile(req.task.outputFilePath);
})

// mock up the backend handler
backend.post('/actions/tasks/:taskId/upload', (req, res, next ) => {
	// verify the post body and save to the result
	// WARNING: the content-type should not be application/json, otherwise it will trigger body-parser
	var ret = req.task.upload(req.body);
	res.json({success: true, payload:ret, version:0});

});

backend.post('/actions/tasks/:taskId/status', (req, res, next ) => {
	// change the task status
	var ret = req.task.changeStatus(req.body);
	res.json({success: true, payload:ret, version:0});
});

app.use('/backend',backend);

var server = app.listen(PORT, () => {
	console.log(`External crawler tester is running on http://localhost:${PORT} or https://127.0.0.1:${PORT}`);
})

function shutdown() {
	console.warn('The external craweler tester is shutting down');
	server.close();
	process.exit(0);
}