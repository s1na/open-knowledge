import { Deployer } from '../../../eth/tcr.js/dist/tcr.cjs.js'
import OpenKnowledge from './open-knowledge'
import ipfs from './ipfs-mem'
import { web3 } from './test-utils'

let ok

beforeAll(async () => {
  await ipfs.dag.init()

  const deployer = new Deployer(web3.currentProvider)
  let contract = await deployer.newRegistry()
  ok = new OpenKnowledge(ipfs, web3.currentProvider, contract)
  await ok.init()
})

test('should instantiate', async () => {
  expect(typeof ok).toBe('object')
})

test('should have no graph manager initially', async () => {
  let m = await ok.getGraphManager('default')
  expect(m).toBe(null)
})

test('should add new graph manager', async () => {
  let m = await ok.newGraphManager('test')
  expect(typeof m).toBe('object')
  expect(m).toHaveProperty('graph')
  expect(await m.graph.id()).toEqual('test')
})

test('should apply for the new graph', async () => {
  let hash = web3.utils.sha3('test')

  let m = await ok.getGraphManager('test')
  expect(await m.graph.id()).toEqual('test')

  let listing = await ok.registry.apply(m.graph, 120)
  expect(listing.hash).toEqual(hash)
  expect(listing.whitelisted).toBe(false)
})

test('should add triples for graph', async () => {
  let tx = await ok.addTriples([['s', 'p', 'o']], 'test')
  expect(tx === null).toBe(false)
})

test('should get triple pattern for graph', async () => {
  let res = await ok.getTriples(null, null, null, 'test')
  expect(res).toHaveLength(1)
  expect(res[0]).toEqual(['s', 'p', 'o'])
})

test('should allow getting triples for previous version', async () => {
  let res = await ok.getTriples(null, null, null, 'test:0')
  expect(res).toHaveLength(0)
})
