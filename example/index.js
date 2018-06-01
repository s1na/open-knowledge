'use strict'

//const IPFS = require('ipfs')
const fs = require('fs')
const { promisify } = require('util')

const ipfsAPI = require('ipfs-api')
const N3 = require('n3')
const Web3 = require('web3')

const OpenKnowledge = require('../dist/open-knowledge.cjs.js')

const readFile = promisify(fs.readFile)

const ipfsOptions = {
  EXPERIMENTAL: {
    pubsub: true
  }
}

//const ipfs = new IPFS(ipfsOptions)
const ipfs = ipfsAPI('/ip4/0.0.0.0/tcp/5001')
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:9545'))

//const repo = 'zdpuAyhAEpWMrf8zLS3yMXqnXtamciLq8zNUGmw7LxX91A7aE'
//const repo = 'zdpuB199RQXfpMoDYEWPfdpyLyivFVZRzfbQACPMpWxU2Q6ws'
const GMAddr = '0x345ca3e014aaf5dca488057592ee47305d9b3e10'
const GMAbi = [
  {
    "constant": true,
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "root",
    "outputs": [
      {
        "name": "",
        "type": "bytes"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_root",
        "type": "bytes"
      }
    ],
    "name": "setRoot",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

const graphManager = new web3.eth.Contract(GMAbi, GMAddr)

const ok = new OpenKnowledge(ipfs, graphManager)
ok.init().then(async () => {
  await ok.store.addGraph('default')
  await ok.addTriple('http://en.wikipedia.org/wiki/Tony_Benn', 'http://purl.org/dc/elements/1.1/title', 'Tony Benn', 'default')

  await ok.store.addGraph('dbpedia')
  let doc = await readFile('Isaac_Asimov.n3', 'utf8')
  let n = 10
  let quads = []
  const parser = N3.Parser()
  let res = parser.parse(doc, async (err, quad, prefixes) => {
    if (err) {
      throw new Error(err)
    }

    if (quad === null) {
      console.log('Finished parsing quads, attemping batch insert')
      quads = quads.slice(0, 5)
      await ok.store.addGraph('test')
      await ok.store.addTriples(quads, 'test')

      console.log('Store size: ', ok.store.size())
      console.log(await ok.store.getTriples(null, 'http://dbpedia.org/ontology/author', null, 'test', 0, 1))
      console.log(await ok.store.getTriples(null, null, null, 'test', 1, 3))

      await ok.execute('SELECT * {\
        <http://dbpedia.org/resource/Lucky_Starr_and_the_Big_Sun_of_Mercury> <http://dbpedia.org/ontology/author> ?o.\
        ?s <http://dbpedia.org/ontology/influenced> ?o } LIMIT 100')

      // console.log(JSON.stringify(await ok.store.dag.getState(), null, '  '))

      return
    }

    quads.push([quad.subject.value, quad.predicate.value, quad.object.value, 'dbpedia'])
  })

  /*
  await ok.addTriple('http://dbpedia.org/resource/Isaac_Asimov', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Person', 'default')
  await ok.addTriple('http://dbpedia.org/resource/Isaac_Asimov', 'http://www.w3.org/2000/01/rdf-schema#label', 'Isaac Asimov', 'default')*/

})
