Open Knowledge
==============

[![CircleCI](https://circleci.com/gh/s1na/open-knowledge.svg?style=svg)](https://circleci.com/gh/s1na/open-knowledge)

Decentralized open linked data for your (decentralized) applications.

**Note:** This library is in early development phase, and therefore not suitable for production use.

Overview
--------

OpenKnowledge (OK) provides an easy way for developers to query openly available linked data,
such as directors and actors of movies (from dbpedia) or results of bioinformatics studies,
in their (decentralized) applications.

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

IPFS and web3 are also peer dependencies, and should be installed:

```shell
$ npm install ipfs-api
$ npm install web3
```

Import the library in your code and instantiate an object according to the node example. Then
you can query the data:

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
$ npm run build

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
