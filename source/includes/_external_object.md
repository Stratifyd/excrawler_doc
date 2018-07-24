# External Object

External object is a [relational object](#relational-object) representing a resigtered crawler on the backend.

## Create/Update an External Object

`POST /externals`

`PATCH /externals/{fid}`

```javascript

APIPost( `/externals`, {
	meta: {
		name: 'display name',
		image: 'url to your icon',
		description: 'bla bla bla'
	},
	parameters: [
		/*parameter list*/
	],
	crendential: {
		oauth: 'https://my_oauth_callback',
	},
	analysis: { /* analysis prototype */ }

},(json) => {

	var { payload } = json;
	var { meta } = payload;
	var { fid, version }

	/*
		Keep the fid and version.
		The fid is the unique id to indetify your crawler on BE.
		The BE will send the version to the external server in the url parameter.
		The version number get increased everytime the dev changes the external object.
	*/

})

```
<aside class="notice">
Crawler dev should keep the fid and version.
</aside>

The fid is the unique id to indetify your crawler on BE.
The BE will send the version to the external server in the url parameter.
The version number get increased everytime the dev changes the external object.

Fields | Meaning
------ | -------
meta   | Name, image, description
endpoint | A REST API end point.  eg. https://excrawler.stratifyd.com
credential | Credential requirement.  It can be undefined, 'basic' or 'oauth'.
oauth  | A callback url to trigger OAuth procedure.  This will be opened in a popup browser window.
oauthParameters | Parameters required for OAuth.  These params will be append to the oauth callback url.
schema | A [JSON schema](http://json-schema.org/) to validate the doc in upload request
docIdField | The field name used as unique doc id.  The BE generate the id by the content of the doc when the field is missing.
headers | Custom headers for HTTP requests from BE to EC
parameters | Task parameter list
analysis | Analysis prototype


### Parameter

FE generates UI according to the parameter list.

Field | Meaning
----- | -------
name  | Key of the parameter
display_name | Name on the UI
description | Description
req   | Is required or not, boolean
type  | string, password, bool, date, location, multi_bool, list, multi_search, interger
min   | Minimum value, only legit for numerical type
max   | Maximum value, only legit for numerical type
options | Option list for list|multi_search type.  Each item can be a string or a object of { value, label }
restrictions | List fo restriction rule. Use this to compare values.

Restriction Rule

```javascript
[
	{
		display_name: 'Start Time',
		description: "Select data after this time.",
		type:"date",
		name:"date_range_start",
		restrictions: [
			{
				rule: 'lt',
				target: "date_range_end",
				message: "Must be earlier than the end time"
			}
		]
	},
	{
		display_name: 'End Time',
		description: "Select data before this time.",
		type:"date",
		name:"date_range_end",
		restrictions: [
			{
				rule: 'gt',
				target: "date_range_start",
				message: "Must be later than the start time"
			}
		]
	}
]
```

Field | Meaning
----- | ---------
rule  | gt, gte, lt, lte, eq
target| compare with this param
message | Error message when the comparison fails


## Create a Crawler for a Stream

`POST /actions/externals/{fid}/crawler`

```javascript

APIPost( `/actions/externals/${fid}/crawler`, {
	meta: {
		links: [{
			from: { type: 'streams', fid: stream_id } // there should be one and only one stream
		}]
	},
	params: {
		/*param dict here*/
	},
	crendential: {
		oauth: {
			/* oauth here */
		}
	}
},(json) => {

	var { payload } = json;
	var { crawler, analysis } = payload;
	
	// get one crawler object and one analysis object

})

```

![Data Ingestion](diagrams/dataIngestion.svg)

The crawler action creates a crawler and a predefined analysis, links them to a stream.


