

class Task {

	constructor( external, endpoint ) {

		this.checkExternal(external)

		var fid = 't'+Math.ceil(Math.random()*1000000000).toString(16);
		this._id = fid;
		this._external = external;
		this._body = { fid, 
			endpoint: `${endpoint}/actions/tasks/${fid}`
		}; // send the endpoint to crawler
		this._status = {
			code: 0
		}

		if( external.schema ) {
			var Ajv = require('ajv');
			var ajv = new Ajv();
			var validate = ajv.compile(external.schema);
			this._validate = validate;
		}

		var path = require('path');
		var fs = require('fs');

		var taskPath = path.join(__dirname, `../tasks/${fid}`);

		fs.mkdirSync(taskPath);

		var logFile = path.join( taskPath, 'log.log');
		var outputFile = path.join( taskPath, 'output.log');

		this._log = {
			stream: fs.createWriteStream(logFile),
			filepath: logFile,
		}
		this._output = {
			stream: fs.createWriteStream(outputFile),
			filepath: outputFile,
			count: 0,
		}

	}

	get id() {
		return this._id;
	}

	get logFilePath() {
		return this._log.filepath;
	}

	get outputFilePath() {
		return this._output.filepath;
	}

	close() {

		this.log('task ends');

		this._log.stream.end();
		this._output.stream.end();
	}

	log() {
		var stream = this._log.stream;

		for( var i = 0; i < arguments.length; i++ ) {
			var a = arguments[i];
			if( a.indexOf('[ERROR]\t') === 0 ) { 
				console.error(a);
			} else {
				console.log(a);
			}
			stream.write(a);
			stream.write('\n');
		}

	}

	error() {
		var msgs = [];
		for( var i = 0; i < arguments.length; i++ ) {
			var a = arguments[i];
			msgs.push( '[ERROR]\t'+a );
		}
		this.log.apply( this, msgs );
	}

	fatal() {
		this.error.apply( this, arguments );
		this.close();
	}

	checkExternal( external ) {

		var { endpoint, credential } = external;
		if( !endpoint ) {
			throw new Error('Endpoint is missing');
		}
		if( credential !== 'basic' && credential !== 'oauth' && credential !== 'ignore' ) {
			throw new Error('Illegal credential type');
		}

	}

	setCredential(credential) {

		switch( this._external.credential ) {
			case 'basic':
				if( !credential.password || !credential.user ) {
					throw new Error('Broken User/Password credential');
				}
			break;
			case 'oauth':
				if( !credential.user || !credential.token || !credential.expiry || !credential.issued ) {
					throw new Error('Broken OAuth credential'); 
				}
			break;
			case 'ignore':
				// ignore the credential
			break;
			default:
				throw new Error('The external object has an invalid credential setting');
		}

		this._body.credential = credential;
	}

	setParameters(params) {

		var parameters = this._external.parameters;
		if( parameters ) {
			// check the parameters
			for( var i = 0; i < parameters.length; i++ ) {
				var p = parameters[i];
				var { name, req, regex, min, max } = p;
				var v = params[name];
				if( undefined !== v ) {
					if( regex && !(new RegExp(regex)).test(v) ) {
						throw new Error(`Parameter ${name} invalided by regex`);
					}
					if( min && !(v>=min) ) {
						throw new Error(`Parameter ${name} invalided by min`);
					}
					if( max && !(v<=max) ) {
						throw new Error(`Parameter ${name} invalided by max`);
					}
				} else if( req ) {
					throw new Error(`Parameter ${name} is missing`);
				}
			}
		}

		this._body.params = params;

	}


	start( config ) {

		this.log('task begins');

		if( config.credential ) {
			this.setCredential( config.credential );
		}
		if( config.params ) {
			this.setParameters( config.params );
		}


		var request = require("request");
		var external = this._external;
		var { endpoint } = external;
		// send request the end point;
		var body = JSON.stringify(this._body);
		var url = endpoint+'/task';

		var opts = {
			url,
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			gzip: true,
			strictSSL: false,
			body,
		}

		this.log('POST '+url);
		
		var req = request( opts, (error, response, body ) => {
			if( error ) {
				this.fatal('Fail to start the task', error);
			} else {
				this.log('Waiting for the data');
			}
		});

		return {
			code: 0,
			message: 'Start Testing'
		}


	}

	upload(raw) {

		// validate the data
		this.log('receive upload');

		var schema = this._external.schema;

		var output = this._output;
		var validate = this._validate;
		var { stream, count } = output;

		var rows = raw.split('\n');
		
		for( var i = 0; i < rows.length; i++ ) {
			var r = rows[i];
			var json;
			try {
				json = JSON.parse(r);
			} catch(e) {
				this.fatal(`Document is broken at line ${count}`); 
			}
			if( json && validate ) {
				//TODO: implement json schema validator
				if( !validate(json) ) {
					this.fatal(`Document doesn't match schema at line ${count}`);
				}
			}
			stream.write(r);
			stream.write('\n');
			count++;
		}

		var ret = {
			count: count - output.count
		}
		// update line number
		output.count = count;
		this.log(`Receive ${ret.count} / ${count}`);

		return ret;
	}

	changeStatus(change) {

		var { code } = change;

		var msg = `Set status to ${code}`;
		if( code > 200 ) {
			this.error( msg );
		} else {
			this.log( msg );
		}

		var status = this._status;
		this._status = { ...status, ...change }

		if( code === 200 ) {
			// crawler ends properly
			this.close();
		}

		return this._status;

	}


}

var gTasks = {}; // the running tasks

/**
 * Locate the running task
 * @param {*} taskId 
 */
function findTask( taskId ) {
	return gTasks[taskId];
}

/**
 * 
 * @param {Object} external The external crawler config
 * @param {Object} config  The task config
 */
function createTask( external, endpoint ) {

	var task = new Task( external, endpoint );
	gTasks[task.id] = task;

	console.log(`Task ${task.id} is created. Check out log and output.`);
	console.log(`Log: ${task.logFilePath}`);
	console.log(`Output: ${task.outputFilePath}`);

	return task;

}

export {
	findTask,
	createTask
}