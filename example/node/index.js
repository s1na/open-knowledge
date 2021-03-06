'use strict'

const ipfsAPI = require('ipfs-api')
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
//  console.log(await ok.graphManagers.default.store.getTriples(null, 'http://dbpedia.org/ontology/author', null, 0, 1))
//  console.log(await ok.graphManagers.default.store.getTriples(null, null, null, 1, 3))

  let res = await ok.execute(`
        PREFIX dbr: <http://dbpedia.org/resource/>
        PREFIX dbo: <http://dbpedia.org/ontology/>
        SELECT *
        {
          dbr:Lucky_Starr_and_the_Big_Sun_of_Mercury dbo:author ?o.
          ?s dbo:influenced ?o
        } LIMIT 15
      `)

  console.log('Query finished: ', res)

  res = await ok.execute(`
        PREFIX dbr: <http://dbpedia.org/resource/>
        PREFIX dbo: <http://dbpedia.org/ontology/>
        SELECT ?s
        FROM <openknowledge:test>
        {
          { dbr:OpenShift dbo:programmingLanguage ?o } UNION { dbr:OpenStack dbo:programmingLanguage ?o }
          ?s dbo:programmingLanguage ?o
        } LIMIT 15
      `)

  console.log('Query finished: ', res)
})
