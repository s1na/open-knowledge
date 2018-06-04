'use strict'

const fs = require('fs')
const { promisify } = require('util')
const readFile = promisify(fs.readFile)

const ipfsAPI = require('ipfs-api')
const N3 = require('n3')
const Web3 = require('web3')

const OpenKnowledge = require('../dist/open-knowledge.cjs.js')
const GraphManager = require('../build/contracts/GraphManager.json')

const ipfs = ipfsAPI('/ip4/0.0.0.0/tcp/5001')
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:9545'))

const GMAddr = GraphManager.networks['4447'].address
const GMAbi = GraphManager.abi
const graphManager = new web3.eth.Contract(GMAbi, GMAddr)

const ok = new OpenKnowledge(ipfs, graphManager)
ok.init().then(async () => {
  let doc = await readFile('Isaac_Asimov.n3', 'utf8')
  let n = 10
  let triples = []
  const parser = N3.Parser()
  let res = parser.parse(doc, async (err, quad, prefixes) => {
    if (err) {
      throw new Error(err)
    }

    if (quad === null) {
      console.log('Finished parsing quads, attemping batch insert')
      triples = triples.slice(0, 5)
      await ok.defaultGM.store.addTriples(triples)

      console.log(await ok.defaultGM.store.getTriples(null, 'http://dbpedia.org/ontology/author', null, 0, 1))
      console.log(await ok.defaultGM.store.getTriples(null, null, null, 1, 3))

      let res = await ok.execute(`
        SELECT *
        FROM <http://example.com/test>
        {
          <http://dbpedia.org/resource/Lucky_Starr_and_the_Big_Sun_of_Mercury> <http://dbpedia.org/ontology/author> ?o.
          ?s <http://dbpedia.org/ontology/influenced> ?o
        } LIMIT 100
      `)

      console.log('Query finished: ', res)

      // console.log(JSON.stringify(await ok.defaultGM.store.dag.getState(), null, '  '))

      return
    }

    triples.push([quad.subject.value, quad.predicate.value, quad.object.value])
  })
})
