# Task Object

Task object is a [relational object](#relational-object) representing a crawler task on the backend.
It is also a change set to the stream.  When the user delete the task, he removes the docs from the stream as well.

## Create a Task

`POST /tasks`

```javascript
// in the FE
APIPost( '/tasks', {
	meta: { links: [{ to: { fid: stream_id, type: 'streams' }}], external: external_object_id }
}, (json) => {
})
```

Field | Meaning
----- | --------
meta  | Meta must contains one and only one link to a stream.  Meta should also has a fid of the external object in the field external
params| Parameter dict
credential | It contains either an oauth field or a pair of user/password.




