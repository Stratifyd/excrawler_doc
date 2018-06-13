# External Crawler

External Crawler (<b>EC</b>) is a HTTPS server to crawl data from a certain data source and send to Stratifyd backend (<b>BE</b>).
EC exposes a set of REST API to communicate with BE.
EC writes back data and updates task status throught REST API on BE.
Users can start a new task through Stratifyd frontend (<b>FE</b>).

## API on the External Crawler Side

### Task

EC is responsible to maintain a crawler for each running task on the BE.
Each task has a set of parameters, a credential and a status.

The credential contains either an OAuth field or a pair of user/password.

Credential | Meaning
---------- | -------
oauth | OAuth credential
user | User id
password | Password

The status should contains code, message and an optional detail

Status | Meaning
------ | ------
code | Status code
message | Human readable message
detail | Other details for debugging

Status Code | Meaning
----------- | --------
0   | New
102 | Running
200 | Done
408 | Timeout
500 | Internal Error


### Start a New Task

The BE send all the parameters necessary to create a new task. The EC returns a callback url for this new task.  The EC is also resposible to keep the task id for further operations.

`POST /task`

The post body contains the following values.

Field | Meaning
---------- | -------
fid | Task id. EC should keep it until the task is closed. 
params | Parameters to start the task. FE generates a UI according to the parameters registered in the external object. The user is resposible to fill the params.
credential | An optional object containing user credential. It contains either `oauth` or `user` & `password`. It may contains other custom fields (eg. Foresee, Survey Monkey). OAuth is recommended for a securied access.  The EC should not keep the credential for other tasks.

The response should follow the standard payload format. EC should generate a callback url for further operations.

Field | Meaning
--------|-------
callback | The callback url to notify the status change
status | The current status of the task on EC

```python
# need python example
```

```javascript
$.post(`${EC_end_point}/task`, {

	fid: `task_object_id`,
	params: {
		/* all necessary parameters */
	},
	credential: {
		oauth: {
			expiry: 'expiry_date', 
			issued: 'token_issue_date', 
			user: 'user_id', 
			reported_name: 'user_display_name'
			email_address: 'user_email'
		}
	}

}, function(json) {

	var payload = json.payload
	var callback = payload.callback;
	var status = payload.status; // the current status
	// keep the callback for further operation

})
```

### Notify Task Change

The BE notify the status change through the callback it received from the new task call.
It's recommended to reuse the `/task` call.

`PATCH /task/{taskId}/status`

The post body

Field | Meaning
---------- | -------
code | Status change
message | Message for human's eyes
detail | Extra message ( eg. exception detail ) for debuging


```python
# need python example
```

```javascript
$.patch(`${EC_end_point}/task/${taskId}/status`, {
	code: 408,
	message: 'Task is timeout',
}, function(json) {
	// recycle the resource
})
```

## API on the Backend Side

### Upload Data

The EC post data to the BE in JSON with new line (<b>CR</b>);
Each doc is a JSON dictionary. Escape each new line char for string values.
Docs are joined with CR. So that the FE can post with gzipped stream.

`POST /actions/tasks/{task_id}/upload`

```python
# need python example
```

```javascript

$.post(`/actions/tasks/${task_id}/upload`,
	docs.map(function(d){ 
		return JSON.stringify(d,function(key,value){
			if( typeof(value) === 'string' ) {
				return string.replace(/\n/g,' ');
			}
		}); 
	}).join('\n'), function(result) {
		// OK
	}).fail(function(jqxhr) {
		switch( jqxhr.status ) {
			case 400:
				// broken post body
			break;
			case 406:
				// doc is invalid 
			break;
		}
	});
```


### Change Status

The EC can close the task or report any status change. The status change also reflected in the stream linked to task.

`POST /actions/tasks/{task_id}/status`

The post body

Field | Meaning
---------- | -------
code | Status change
message | Message for human's eyes
detail | Extra message ( eg. exception detail ) for debuging


## Developing Workflow

1. Start
1. Register an external crawler by create an <a href='#external-object'>external object</a>
