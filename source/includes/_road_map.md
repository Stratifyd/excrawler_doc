# Roadmap

## Stage 0

Restore the exiting crawler working under the old framework. For demo and Live Person.

1. Use the `/external` call to create crawler object and analysis.
2. The crawler object keep the parameters and credential. It push data directly to the stream.

## Stage 1

Implement the external crawler protocol.  Have the data ingestion workflow ready.

1. Replace `/external` call with external object.
2. Use `/action/externals/{fid}` to create crawler object and analysis.
3. Crawler objects breed task objects to get data from external crawler server.
4. Each task object clone the parameters from the crawler object, and send them to external server with credentials from the same crawler object.  It doesn't keep credential.
5. Task object is a change set.  It ingests the data to the stream once it's linked to the stream. User can remove the data by deleting task object.

## Stage 2

Implement admin management feature.  Implement JSON Schema validation to enable BE detect crawler malfunction.

1. Validate docs in each upload with JSON schema. 
2. The subdomain admin can publish a specific version of a crawler. 
3. The crawler dev has a developing version only accessible to himself.

