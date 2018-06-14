# Crawler Object

Crawler object is a [relational object](#relational-object) representing a external crawler setting on the backend.
A one time crawler breeds a task object.
A scheduled crawler breeds multiple task objects sequentially.

First the FE has to get the right [external object](#external-object).  Has the user complete credential and parameter list.

Then the user start a crawler by creating a crawler object.

A stream can has only one crawler object linked.  And a crawler can has only one stream linked to itself.

## Create a Crawler

`POST /crawlers`

```javascript
// in the FE
APIPost( '/crawlers', {
	meta: { links: [{ to: { fid: stream_id, type: 'streams' }}], external: external_object_id }
}, (json) => {
})
```

Field | Meaning
----- | --------
meta  | Meta must contains one and only one link to a stream.  Meta should also has a fid of the external object in the field external
params| Parameter dict
credential | It contains either an oauth field or a pair of user/password.



