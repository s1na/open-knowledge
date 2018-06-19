Open Knowledge
==============

[![CircleCI](https://circleci.com/gh/s1na/open-knowledge.svg?style=svg)](https://circleci.com/gh/s1na/open-knowledge)

Decentralized open linked data for your (decentralized) applications.

*Note:* This library is in early development phase, and therefore not suitable for production use.

Usage
-----

First, install the library via npm:

```shell
$ npm install git+https://git@github.com/s1na/open-knowledge.git
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
$ npm install

# Install rollup, for bundling the library
$ sudo npm -g install rollup

# Install truffle, for building contracts
$ sudo npm -g install truffle

# Install ganache-cli, for a custom ethereum network
$ sudo npm -g install ganache-cli

# Start IPFS daemon
$ ipfs daemon

# Start ganache, with network name dev
$ ganache-cli -i dev

# To build contracts
$ truffle build

# To build library, the result will be in dist/
$ npm run build

# To run node examples
$ cd example/node
$ npm install
$ node publish.js
$ node index.js
```

Acknowledgement
---------------

This project is being developed as part of the master's thesis of [Sina Mahmoodi](https://github.com/s1na) at [Fraunhofer SCAI](https://scai.fraunhofer.de).
