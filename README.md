Open Knowledge
==============

[![CircleCI](https://circleci.com/gh/s1na/open-knowledge.svg?style=svg)](https://circleci.com/gh/s1na/open-knowledge)

Decentralized open linked data for your (decentralized) applications.

**Note:** This library is in early development phase, and therefore not suitable for production use.

Overview
--------

OpenKnowledge (OK) provides an easy way for developers to query openly available linked data,
such as directors and actors of movies (from dbpedia), name of all cities in a country,
or results of bioinformatics studies, in their (decentralized) applications.

On the other hand it enables data producers to publish their data directly to subscribers,
without a central authority, and without the need for maintaining servers, benefiting from
features such as versioning and attribution.

OK is built on top of IPFS and the Ethereum blockchain, and uses RDF (a W3C standard) as its
knowledge representation model and SPARQL as its query language.

Usage
-----

First, install the library via npm or yarn:

```shell
$ yarn add open-knowledge
```

OK depends on IPFS and web3 (for communicating with Ethereum), but in order not to make assumptions,
and remain flexible, they have been defined as peer dependencies, and therefore should be installed
separately.

```shell
$ yarn add ipfs-api
$ yarn add web3
```

Import the library in your code and instantiate an object according to the node example.
If you're developing a dapp, chances are, you already have an IPFS and web3 object. Pass them
to `OpenKnowledge` when instantiating. If not, have a look at the [examples](example/) to see how to initialize
IPFS and web3.

At this point, it's possible to retrieve a list of triples adhering to a pattern:

```javascript
let res = await ok.getTriples(null, 'http://dbpedia.org/ontology/influenced', null, 'dbpedia')
```

Triple patterns suffice in many cases, but for complex queries, you can write a SPARQL query and execute it:

```javascript
let res = await ok.execute(`
  PREFIX dbr: <http://dbpedia.org/resource/>
  PREFIX dbo: <http://dbpedia.org/ontology/>
  FROM <openknowledge:dbpedia>
  SELECT *
  {
    dbr:Lucky_Starr_and_the_Big_Sun_of_Mercury dbo:author ?o.
    ?s dbo:influenced ?o
  } LIMIT 15
`)
```

The two previous examples only return triples located in one knowledge graph. You can use the full power
of linked data by executing queries over multiple knowledge graphs:

```javascript
let q = `
  PREFIX dbr: <http://dbpedia.org/resource/>
  PREFIX dbo: <http://dbpedia.org/ontology/>
  SELECT *
  {
    dbr:Lucky_Starr_and_the_Big_Sun_of_Mercury dbo:author ?o.
    ?s dbo:influenced ?o.
    ?p dbo:wikiPageRedirects ?s
  } LIMIT 15
`

let res = await ok.executeFederated(q, ['default', 'dbpedia'])
```

In order to publish data, you need to have write permissions in a knowledge graph. You can
create a knowledge graph of your own, in which case you become the owner of the graph. This operation
requires gas.

```javascript
let manager = await ok.newGraphManager('myGraph')
```

Then you can add triples to the knowledge graph, either by calling `addTriples` on the `GraphManager` directly
or by passing the graph name along with the triples to the `OpenKnowledge` instance.

```javascript
let tx = await ok.addTriples([['subject', 'property', 'object']], 'myGraph')
```

Please note that OK does not offer database functionalities and is not suitable for dynamic and fast-changing data.
Morever, the data is published unencrypted and can be accessed by everyone.

Development Setup
-----------------

You will need Node.js and either npm or yarn.

```shell
# Install dependencies, in project root
$ yarn

# Install rollup, for bundling the library
$ sudo yarn global add rollup

# Install truffle, for building contracts
$ sudo yarn global add truffle

# Install ganache-cli, for a custom ethereum network
# or use trufflesuite/ganache-cli:latest docker image
$ sudo yarn global add ganache-cli

# Start IPFS daemon, if installed
# or use ipfs/go-ipfs:latest docker image
$ ipfs daemon

# Start ganache, with network name dev
$ ganache-cli -i dev

# Deploy contracts on ganache
$ yarn contracts:deploy

# To build library, the result will be in dist/
$ yarn build

# To run node examples
$ cd example/node
$ yarn
# Publish some test data
$ node publish.js
# Query the published data
$ node index.js
```

Contribute
-------------

Contribution in any form is appreciated. If you find a bug, or want to discuss or provide feedbacks in any way,
go ahead and create an issue. PRs are also more than welcome.

Acknowledgement
---------------

This project is being developed as part of the master's thesis of [Sina Mahmoodi](https://github.com/s1na) at [Fraunhofer SCAI](https://scai.fraunhofer.de).
