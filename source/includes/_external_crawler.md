# External Crawler

![top level design](diagrams/topLevelDesign.svg)

External crawler (<b>EC</b>) is a HTTPS server to crawl data from a certain data source and send to Stratifyd backend (<b>BE</b>).
EC exposes a set of REST API to communicate with BE.
EC writes back data and updates task status throught REST API on BE.
Users can start a new task through Stratifyd frontend (<b>FE</b>).

External crawler developer (<b>Dev</b>) is responsible to register/update the [external object](#external-object) (<b>EObj</b>) on BE.
Subdomain admin is responsible to publish a specific version of the crawler.

<aside class="notice">
There should be not more than one version under development on the BE.
There is only one version published across a specific subdomain.
</aside>

<aside class='warning'>
Admin feature and JSON Schema is not available until Stage 2.
</aside>

![create crawler](diagrams/createCrawler.svg)

The front end user is responsible to grant access and fill necessary parameters to start the crawler.

![task lifecycle](diagrams/taskLifecycle.svg)

BE is responsible to delegate the task request to EC, receive upload from EC, monitor task status change, post notification to FE.

## External Crawler Server

![task lifecycle](diagrams/externalCrawlerServer.svg)


### Task

![task lifecycle](diagrams/externalCrawlerTask.svg)

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

`POST /task?version={external_crawler_version}`

```python
# need python example
```

```javascript
$.post(`${EC_end_point}/task?version=${external_crawler_version}`, {

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

The post body contains the following values.

Field | Meaning
---------- | -------
fid | Task id. EC should keep it until the task is closed. 
params | Parameters to start the task. FE generates a UI according to the parameters registered in the external object. The user is resposible to fill the params.
credential | An optional object containing user credential. It contains either `oauth` or `user` & `password`. It may contains other custom fields (eg. Foresee, Survey Monkey). OAuth is recommended for a securied access.  The EC should not keep the credential for other tasks.
endpoint | The endpoint url for the crawler to upload and change task status

The response should follow the standard payload format. EC should generate a callback url for further operations.

Field | Meaning
--------|-------
callback | The callback url to notify the status change
status | The current status of the task on EC


### Notify Task Change

The BE sends the status change through the callback it received from the new task call.
It's recommended to reuse the `/task` call.

`PATCH /task/{taskId}/status?version={external_crawler_version}`

```python
# need python example
```

```javascript
$.patch(`${EC_end_point}/task/${taskId}/status?version=${external_crawler_version}`, {
	code: 408,
	message: 'Task is timeout',
}, function(json) {
	// recycle the resource
})
```

The post body

Field | Meaning
---------- | -------
code | Status change
message | Message for human's eyes
detail | Extra message ( eg. exception detail ) for debuging


## OAuth Support

External crawler server can support OAuth buy putting a endpoint url in the [external object](#external-object) oauth field.
EC server is responsible to keep tokens.  And clear the token after it receive a [clear request](#clear-token).

The endpoint gets a uuid (user id) and subdomain from the FE in the url params.

OAuth Params | Meaning
------------ | -------
uuid | Backend user id
subdomain | Subdomain for the current FE
reset | Force reset the existing token. Set this to 1 when user want to swtich to another account.

The OAuth endpoint has to support the following calls.

### Login

`GET {oauth_end_point}/login?uuid={uuid}&subdomain={subdomain}&reset={reset}`

```javascript
// pop up a oauth window
var win = window.open( `${oauth_end_point}/login?uuid=${uuid}&subdomain=${subdomain}&reset=0`,
	'ConnectWithOAuth', 
	'location=0,status=0,width=640,height=440' );
var testInterval = window.setInterval(function(){
	if( win && win.closed ) {
		thirdPartyToken(party, current_uuid, callback, true);
		window.clearInterval(testInterval);
	} else {
		// something wrong within the oauth window
	}
}, 500);
```

The FE pop up a window for the OAuth request.  User will be redirected to thirdparty authentication page and complete the oauth.  When the OAuth is completed, the thirdparty page should redirect itself to EC server.  Then the EC server return a HTML page with a `<script>window.close()</script>` to close the popup window.

The user may abort the OAuth by closing the popup window anytime.

### Get Token

`GET {oauth_end_point}/token?uuid={uuid}&subdomain={subdomain}`

```javascript
$.get(`${oauth_end_point}/token?uuid=${uuid}&subdomain=${subdomain}`, function(oauth){

	/*
		the oauth should has user, expiry, issued, token
	*/

	// must have
	var { user, expiry, issued, token } = oauth;

	// optional
	var { reported_name, email_address } = oauth;

	// the FE will put this into crawler object
	
}).fail(function(jqxhr,textStatus,error){
	// oauth failed
	if( jqxhr.status === 404 ) {
		// token doesn't exist
	}
})
```

> OAuth should looks like 

```json
{
	"expiry": "expiry_date", 
	"issued": "token_issue_date", 
	"user": "user_id", 
	"token": "token",
	"reported_name": "user_display_name",
	"email_address": "user_email"
}
```

OAuth Field | Meaning
------------------ | -------
user | Third-party service user id. ( It's not the BE user id )
token | Token
expiry | Token expiry timestamp
issued | Token issue timestamp

Optional Result | Meaning
--------------- | --------
reported_name | User display name
email_address | User email

### Clear Token

`DELETE {oauth_end_point}/token?uuid={uuid}&subdomain={subdomain}`

> The EC server should not keep the token after clear call

```javascript
// clear the token
$.delete(`${oauth_end_point}/token?uuid=${uuid}&subdomain=${subdomain}`,(json)=>{
	$.get(`${oauth_end_point}/token?uuid=${uuid}&subdomain=${subdomain}`,()=>{
		assert( false, 'the ES server should return 404 after the delete call'.
	}).fail((jqxhr)=>{
		assert( jqxhr.status === 404, 'the EC server should return 404 after the delete call' )
	}
})
```


## Backend Server

BE exposes [task object](#task-object) to the external crawler server.

1. Upload data through `POST /actions/tasks/{task_id}/upload`.
2. Notify task status change throuhg `POST /actions/tasks/{task_id}/status`


