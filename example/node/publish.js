'use strict'

const fs = require('fs')
const { promisify } = require('util')

const ipfsAPI = require('ipfs-api')
const Web3 = require('web3')

const OpenKnowledge = require('../../dist/open-knowledge.cjs.js').OpenKnowledge
const GraphRegistry = require('../../dist/open-knowledge.cjs.js').GraphRegistry
const GraphRegistryContract = require('../../build/contracts/GraphRegistry.json')

const readFile = promisify(fs.readFile)

const ipfs = ipfsAPI('/ip4/0.0.0.0/tcp/5001')
const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'))

const GRAddr = GraphRegistryContract.networks['dev'].address
const GRAbi = GraphRegistryContract.abi
const contract = new web3.eth.Contract(GRAbi, GRAddr)
const registry = new GraphRegistry(web3, contract)

const ok = new OpenKnowledge(ipfs, registry)
ok.init().then(async () => {
  publishFile(ok, 'Isaac_Asimov.n3', 'default', -1)
  publishFile(ok, 'Go_(programming_language).n3', 'test', -1)
})

async function publishFile (ok, path, g, n = 10) {
  let doc = await readFile(path, 'utf8')
  let triples = await ok.parse(doc)
  if (n >= 0) {
    triples = triples.slice(0, n)
  }

  await ok.addTriples(triples, g, true)
  console.log('Added triples to', g)
}
