var kSampleDocs = undefined;

export default class DemoCrawler {

	constructor( config ) {

		var { fid, endpoint } = config; 
		
		if( typeof(endpoint) !== 'string' || !endpoint.match(/http(?:s?)\:\/\//) ) {
			throw new Error( 'Invalid callback in the task config' );
		}
		this._config = config;
		this._timer = setTimeout(this._postData.bind(this,0),Math.ceil(10000*Math.random()))
		this._docId = 0;
		this._timestamp = ((new Date).getTime()-24*3600*1000);
		this._status = { code: 0 }
	}

	start() {

		var config = this._config;
		var status = this._status;

		status.code = 102;
		status.message = "Start Demo Crawler";

		return {
			callback: `/task/${config.fid}`,
			status: status,
		}

	}

	_generateSampleDocs(size) {

		var config = this._config;
		var samples = this._loadSamples();
		var docId = this._docId;
		var timestamp = this._timestamp;

		var buf = [];
		
		var limit = config.params.limit;
		var chunkSize = Math.min( size, limit - docId );

		for( var i = 0; i < chunkSize; i++ ) {
			buf.push({
				docId: docId,
				time: (new Date(timestamp)).toLocaleString(),
				text: samples[docId%samples.length]
			})
			docId++;
			timestamp += Math.ceil(5*60*1000*Math.random());
		}

		this._docId = docId, this._timestamp = timestamp;

		return buf.map(function(json) { return JSON.stringify(json); }).join('\n');

	}

	_loadSamples() {
		
		if( !kSampleDocs ) {
			var path = require('path');
			var file = path.join(__dirname, './samples/sample.txt');
			var fs = require('fs');
			var contents = fs.readFileSync(file, {
				encoding: 'utf8'
			});
			var rows = contents.split('\n');
			kSampleDocs = rows.filter(function(str) {
				return str.trim() ? true : false;
			});
		}

		return kSampleDocs;
	}

	_postData(step) {

		console.log(`Upload sample data chunk ${step}`);
		// upload data;
		var body = this._generateSampleDocs(50);
		this._call( 'POST', '/upload', { 'content-type': ' application/x-ndjson', encoding: 'UTF-8' }, body, (error,response,body)=>{
			if( error ) {
				console.error(`Fail to upload data chunk ${step}`, error);
			} else {
				if( this._docId < this._config.params.limit ) {
					// trigger the next upload
					this._timer = setTimeout(this._postData.bind(this,step+1),Math.ceil(10000*Math.random()))
				} else {
					// close the task
					this._call( 'POST', '/status', { 'content-type': 'application/json', encoding: 'UTF-8' }, JSON.stringify({
						code: 200,
						message: "Task ends",
					}), ( error, response, body ) => {
						if( error ) {
							console.error(`Fail to close task`, error);
						} else {
							console.log('Task is done.')
						}
					});
				}
			}
		});

	}

	_call( method, rURL, headers, body, callback ) {

		var config = this._config;
		var request = require("request");

		var url = config.endpoint + rURL;

		var opts = {
			url,
			method: method,
			headers,
			gzip: true,
			strictSSL: false,
			body,
		}

		request( opts, callback );

	}


}