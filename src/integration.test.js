import { Deployer } from '../../../eth/tcr.js/dist/tcr.cjs.js'

import OpenKnowledge from './open-knowledge'
import ipfs from './ipfs-mem'
import { web3, publishFile, sleep } from './test-utils'

let ok

describe('should perform basic query', () => {
  beforeAll(async () => {
    await ipfs.dag.init()

    const deployer = new Deployer(web3.currentProvider)
    let params = deployer.defaultParams
    // Set apply stage to 1 sec
    // to test whitelisted listings
    params[2] = 1
    let contract = await deployer.newRegistry()
    ok = new OpenKnowledge(ipfs, web3.currentProvider, contract)
    await ok.init()
  })

  test('should create new default graph', async () => {
    let m = await ok.newGraphManager('default')
    expect(await m.graph.id()).toEqual('default')
  })

  test('should apply for graph', async () => {
    let hash = web3.utils.sha3('default')
    let m = await ok.getGraphManager('default')
    let listing = await ok.registry.apply(m.graph, 120)
    expect(listing.hash).toEqual(hash)
    // Wait to be whitelisted
    await sleep(1000)
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

    await publishFile(ok, 'example/node/Isaac_Asimov.n3', 'default', 0, 10)
    let res = await ok.execute(q1)
    expect(res).toHaveLength(10)

    res = await ok.execute(q2)
    expect(res).toHaveLength(1)
    expect(res[0]['?s']).toBe('http://dbpedia.org/resource/John_W._Campbell')
  })

  test('should query previous versions', async () => {
    let q1 = `SELECT * { ?s ?p ?o }`
    let q2 = `SELECT * FROM <openknowledge:default:1> { ?s ?p ?o }`
    await publishFile(ok, 'example/node/Isaac_Asimov.n3', 'default', 10, 11)
    let res = await ok.execute(q1)
    expect(res).toHaveLength(11)
    let res2 = await ok.execute(q2)
    expect(res2).toHaveLength(10)
  })
})

describe('should perform federated query', () => {
  beforeAll(async () => {
    await ipfs.dag.init()

    const deployer = new Deployer(web3.currentProvider)
    let contract = await deployer.newRegistry()
    ok = new OpenKnowledge(ipfs, web3.currentProvider, contract)
    await ok.init()
  })

  test('should create graph manager', async () => {
    let defaultManager = await ok.newGraphManager('default')
    expect(typeof defaultManager).toBe('object')
    let dbpediaManager = await ok.newGraphManager('dbpedia')
    expect(typeof dbpediaManager).toBe('object')
  })

  test('should add triples', async () => {
    await publishFile(ok, 'example/node/Isaac_Asimov.n3', 'default', 0, 10)
    await publishFile(ok, 'example/node/John_W._Campbell.n3', 'dbpedia', 0, 10)

    let res = await ok.getTriples(null, null, null, 'default')
    expect(res).toHaveLength(10)

    res = await ok.getTriples(null, null, null, 'dbpedia')
    expect(res).toHaveLength(10)
  })

  test('should add triples and query successfully', async () => {
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
    expect(res).toHaveLength(10)
    expect(res[0]['?s']).toBe('http://dbpedia.org/resource/John_W._Campbell')
    expect(res[0]['?o']).toBe('http://dbpedia.org/resource/Isaac_Asimov')
  })
})
