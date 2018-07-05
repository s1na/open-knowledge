import fs from 'fs'
import { promisify } from 'util'

import Ganache from 'ganache-core'
import Web3 from 'web3'

import OpenKnowledge from './open-knowledge'
import GraphRegistry from './graph-registry'
import GraphRegistryContract from '../build/contracts/GraphRegistry.json'
import ipfs from './ipfs-mem'

const readFile = promisify(fs.readFile)
let registry
let ok

async function publishFile (path, g, n = 10) {
  let doc = await readFile(path, 'utf8')
  let triples = await ok.parse(doc, n)
  if (n > 0) {
    triples = triples.slice(0, n)
  }

  await ok.addTriples(triples, g)
}

beforeAll(async () => {
  await ipfs.dag.init()

  const provider = Ganache.provider({})
  const web3 = new Web3(provider)
  let accounts = await web3.eth.getAccounts()
  let graphRegistryContract = new web3.eth.Contract(GraphRegistryContract.abi)
  let gas = await graphRegistryContract.deploy({ data: GraphRegistryContract.bytecode }).estimateGas({ from: accounts[0] })
  let contract = await graphRegistryContract.deploy({ data: GraphRegistryContract.bytecode }).send({ from: accounts[0], gas })
  gas = await contract.methods.initialize().estimateGas({ from: accounts[0] })
  await contract.methods.initialize().send({ from: accounts[0], gas })
  registry = new GraphRegistry(web3, contract)
  ok = new OpenKnowledge(ipfs, registry)
  await ok.init()
})

test('should add triples and query successfully', async () => {
  let q1 = `SELECT * { ?s ?p ?o }`
  let q2 = `
    PREFIX dbr: <http://dbpedia.org/resource/>
    PREFIX dbo: <http://dbpedia.org/ontology/>
    SELECT *
    {
      dbr:Lucky_Starr_and_the_Big_Sun_of_Mercury dbo:author ?o.
      ?s dbo:influenced ?o
    } LIMIT 15
  `

  await publishFile('example/node/Isaac_Asimov.n3', 'default', 10)
  let res = await ok.execute(q1, 'default')
  expect(res).toHaveLength(10)

  res = await ok.execute(q2)
  expect(res).toHaveLength(1)
  expect(res[0]['?s']).toBe('http://dbpedia.org/resource/John_W._Campbell')
})
