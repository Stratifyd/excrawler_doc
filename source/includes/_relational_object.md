# Relational Object

Relational object is the fundament of the backend system.  Most of the handlers are relational objects.

## Create

Create a relational object of specific type. The object is initialized with the JSON in the post body.

`POST /{type}`

```python
# need python example
```

```javascript
Signals.APIPost( '/analyses/',
	{
		"meta": {
			"name": "Object Name",
			"links": [{"from": {"type":"stream","fid":"xxxxxxx"}}]
		},
		"params": { /*others*/ }
	}, callback 
);
```

<aside class="notice">
The <code>meta.links</code> is a special field which can be only used in the POST.  It's used to initialize the link graph and it's not returned with any query of the relational object.  Use <code>/links</code> to query the graph.
</aside>

## Patch

Recursively replace the value in the object by keyword.

<aside class="notice">
To change a list/array, you have to send a complete list.
</aside>

`PATCH /{type}/{fid}`

```python
# need python example
```

```javascript
Signals.APIPatch( `/analyses/${fid}`,
	{
		"meta": {
			"name": "new name"
		}
	},callback
);
```

## Overwite

Complete overwrite the existing object.  `meta.links` doesn't work in this call.

`PUT /{type}/{fid}`

```python
# need python example
```

```javascript
Signals.APIPut( `/analyses/${fid}`,
	{
		"meta": {
			"name": "new name"
		}
	},callback
);
```

## Delete

Delete an existing relational object.


`DELETE /{type}/{fid}`

```python
# need python example
```

```javascript
Signals.APIDelete( `/analyses/${fid}`, undefined, callback };
```

## Actions

There are actions calls for specific purpose.  Each type has a different set of actions.

For example

POST `/actions/models/${fid}/train`
