'use strict'

const fs = require('fs')
const { promisify } = require('util')
const readFile = promisify(fs.readFile)

const ipfsAPI = require('ipfs-api')
const N3 = require('n3')
const Web3 = require('web3')

const OpenKnowledge = require('../../dist/open-knowledge.cjs.js').OpenKnowledge
const GraphRegistry = require('../../dist/open-knowledge.cjs.js').GraphRegistry
const GraphRegistryContract = require('../../build/contracts/GraphRegistry.json')

const ipfs = ipfsAPI('/ip4/0.0.0.0/tcp/5001')
const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'))

const GRAddr = GraphRegistryContract.networks['dev'].address
const GRAbi = GraphRegistryContract.abi
const contract = new web3.eth.Contract(GRAbi, GRAddr)
const registry = new GraphRegistry(web3, contract)

const ok = new OpenKnowledge(ipfs, registry)
ok.init().then(async () => {
  publishFile('Isaac_Asimov.n3', 'default', -1)
  publishFile('Go_(programming_language).n3', 'test', -1)
})

async function publishFile(path, g, n=10) {
  let doc = await readFile(path, 'utf8')
  let triples = []
  const parser = N3.Parser()
  let res = parser.parse(doc, async (err, quad, prefixes) => {
    if (err) {
      throw new Error(err)
    }

    if (quad === null) {
      console.log('Finished parsing quads, attemping batch insert')
      if (n >= 0) {
        triples = triples.slice(0, n)
      }
      let tx = await ok.addTriples(triples, g)
      console.log('TX:', tx)

      return
    }

    triples.push([quad.subject.value, quad.predicate.value, quad.object.value])
  })
}
