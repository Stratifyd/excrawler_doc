# Crawler Object

Crawler object is a [relational object](#relational-object) representing a external crawler setting on the backend.
A one time crawler breeds a task object.
A scheduled crawler breeds multiple task objects sequentially.

First the FE has to get the right [external object](#external-object).  Has the user complete credential and parameter list.

Then the user start a crawler by creating a crawler object.

A stream can has only one crawler object linked.  And a crawler can has only one stream linked to itself.

## Create a Crawler

Use `POST /actions/externals/{fid}/crawler`

FE should not create a crawler without external object.

## Start a New Task

`POST /actions/crawlers/{fid}/task`

```javascript
// in the FE
APIPost( '/actions/crawlers/${fid}/task', {
	params: { /* override params if necessary */ }
}, (json, status, xhr ) => {

	if( jqxhr.status === 208 ) {
		// there is a running task
	}

})
```

The task import params and credential from the crawler and send them to external server.
It merges the params in the post body with the params from crawler.

Return `208` if there is a running task for the crawler

## Retry a Task

`POST /actions/crawlers/{fid}/task/${task_fid}`





