import GraphManager from './graph-manager'
import Graph from './graph'
import GraphContract from '../build/contracts/Graph.json'
import ipfs from './ipfs-mem'
import { web3, deployContract } from './test-utils'

let graph
let m

beforeAll(async () => {
  await ipfs.dag.init()

  let accounts = await web3.eth.getAccounts()
  let hex = web3.utils.utf8ToHex('test')
  let contract = await deployContract(GraphContract, null, [accounts[0], hex])
  graph = new Graph(web3, contract)
  m = new GraphManager(ipfs, graph)
})

test('should instantiate', async () => {
  expect(typeof m).toBe('object')

  await m.init()
  expect(m.store).toBeDefined()
})

test('should add triples', async () => {
  let tx = await m.addTriples([['http://example.com/s', 'http://example.com/p', 'http://example.com/o']])
  expect(tx === null).toBe(false)
  expect(tx).toHaveProperty('events.RootUpdated.returnValues.root')
  expect(await graph.root()).toEqual(await m.store.root)
})

test('should submit diff', async () => {
  let tx = await m.addTriples([['http://example.com/foo', 'http://example.com/bar', 'http://example.com/baz']], true)
  expect(tx).not.toBe(null)
  expect(tx).toHaveProperty('events.RootUpdated.returnValues.root')
  expect(await graph.root()).toEqual(await m.store.root)

  let dcid = await graph.diff()
  let diff = await m.store.dag.get(dcid)
  expect(typeof diff).toBe('object')
  expect(diff).toHaveProperty('spo')
  expect(diff.spo).toEqual({ 'http%3A%2F%2Fexample.com%2Ffoo': { 'http%3A%2F%2Fexample.com%2Fbar': { 'http%3A%2F%2Fexample.com%2Fbaz': true } } })
})

test('should get triple pattern', async () => {
  let res = await m.getTriples(null, null, 'http://example.com/o')
  expect(res).toHaveLength(1)
  expect(res[0]).toEqual(['http://example.com/s', 'http://example.com/p', 'http://example.com/o'])
})

test('should execute query', async () => {
  let q = 'PREFIX : <http://example.com/> SELECT * WHERE { ?s :p :o }'
  let res = await m.execute(q)
  expect(res).toHaveLength(1)
  expect(res[0]).toEqual({ '?s': 'http://example.com/s' })
})
