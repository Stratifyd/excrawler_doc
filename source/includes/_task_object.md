# Task Object

Task object is a [relational object](#relational-object) representing a crawler task on the backend.
It is also a change set to the stream.  When the user delete the task, he removes the docs from the stream as well.

## Create Task

Use `POST /actions/crawlers/{fid}/task`

FE should not create a task without crawler object.

## Delete Task

`DELETE /actions/tasks/{fid}`

Stop the task and remove the doc from the stream.

## Retry Task

Use `POST /actions/crawlers/{fid}/task/${task_fid}`


## Upload Data

The EC post data to the BE in JSON with new line (<b>CR</b>);
Each doc is a JSON dictionary. Escape each new line char for string values.
Docs are joined with CR. So that the FE can post with gzipped stream.

`POST /actions/tasks/{task_id}/upload`

```python
# need python example
```

```javascript
// on the external crawler side
$.post(`/actions/tasks/${task_id}/upload`,
	docs.map(function(d){ 
		return JSON.stringify(d,function(key,value){
			if( typeof(value) === 'string' ) {
				return string.replace(/\n/g,' '); // escape or replace CR.
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


## Change Status

The EC can close the task or report any status change. The status change also reflected in the stream linked to task.

`POST /actions/tasks/{task_id}/status`

```python
# need python example
```

```javascript
// on the external crawler side
$.post(`/actions/tasks/${task_id}/status`,
	{
		code: 200,
		message: 'task done'
	}), function(result) {
		// OK
	}).fail(function(jqxhr) {
		switch( jqxhr.status ) {
			case 400:
				// broken post body
			break;
			case 404:
				// task is not found 
			break;
		}
	});
```

The post body

Field | Meaning
---------- | -------
code | Status change
message | Message for human's eyes
detail | Extra message ( eg. exception detail ) for debuging



