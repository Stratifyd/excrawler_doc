---
title: API Reference

language_tabs: # must be one of https://git.io/vQNgJ
  - python
  - javascript
  - shell


toc_footers:
  - <a href='#'>Sign Up for a Developer Key</a>
  - <a href='https://github.com/lord/slate'>Documentation Powered by Slate</a>

includes:
  - external_crawler
  - external_object
  - task_object
  - relational_object
  - errors

search: true
---

# Introduction

Stratifyd External Crawler Dev Document

# Authentication

> To authorize, use this code:

```python
// get API Key
```

```shell
# With shell, you can just pass the correct header with each request
curl "{end_point}/user/apikey"
```

```javascript
// import signals api
var Signals = require('signals-api').Signals;
// load your credential
var kAPPCredential = require('./appCredential');
// if region is undefined, then it is defaulted to en
// you can replace it with cn cn-2
var region = 'en'
var api = Signals(kAPPCredential,'en');
// do something with the api ...
```

> Make sure to replace `end_point` with your API key.

You can find your API key on the `/explorer.html?mode=setting` or GET through `/user/apikey`

<aside class="notice">
Make sure the API key is not expired.
</aside>


