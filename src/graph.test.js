import Graph from './graph'
import GraphContract from '../build/contracts/Graph.json'
import { web3, deployContract } from './test-utils'

let accounts
let contract
let g
let rootUpdatedMock = jest.fn()
const rootHashes = [
  'zdpuAmKRXTRNSgwSgXqPDP2FuxVeduNMtM113oGDeUDEoKuA1',
  'zdpuAyTBnYSugBZhqJuLsNpzjmAjSmxDqBbtAqXMtsvxiN2v3'
]

beforeAll(async () => {
  accounts = await web3.eth.getAccounts()
  let hex = web3.utils.utf8ToHex('test')
  contract = await deployContract(GraphContract, null, [accounts[0], hex])
  g = new Graph(web3, contract)
  g.onRootUpdated(rootUpdatedMock)
})

beforeEach(() => {
  rootUpdatedMock.mockClear()
})

test('should instantiate', () => {
  expect(typeof g).toBe('object')
  expect(g.contract).toBeDefined()
})

test('should have coinbase as owner', async () => {
  let o = await g.owner()
  expect(o).toEqual(accounts[0].toLowerCase())
  expect(await g.isOwner()).toBe(true)
})

test('should have test id', async () => {
  let id = await g.id()
  expect(id).toEqual('test')
})

test('should have default root', async () => {
  let r = await g.root()
  expect(r).toBe(rootHashes[0])
})

test('should have version 0', async () => {
  let v = await g.version()
  expect(v).toBe(0)
})

test('should set new root', async () => {
  let tx = await g.setRoot(rootHashes[1])
  expect(tx).not.toBe(null)
  expect(tx).toHaveProperty('events.RootUpdated.returnValues.root')
  expect(rootUpdatedMock).toHaveBeenCalledTimes(1)
  expect(rootUpdatedMock).toHaveBeenCalledWith(rootHashes[1])

  let r = await g.root()
  expect(r).toBe(rootHashes[1])

  let v = await g.version()
  expect(v).toBe(1)
})

test('should get past roots', async () => {
  let roots = await g.getPastRoots()
  expect(roots).toHaveLength(2)
  expect(roots[0]).toBe(rootHashes[0])
  expect(roots[1]).toBe(rootHashes[1])
})

test('should get past roots by version', async () => {
  let roots = await g.getPastRoots(1)
  expect(roots).toHaveLength(1)
  expect(roots[0]).toBe(rootHashes[1])
})

test('should set diff', async () => {
  let n = 'zdpuAsMGZ67AjBfzYY8UipuNmwpRnmfbXuh5cjacMeqTF9Y9H'
  let tx = await g.setDiff(n)
  expect(tx).not.toBe(null)
  expect(tx).toHaveProperty('events.DiffUpdated.returnValues.diff')

  let d = await g.diff()
  expect(d).toBe(n)
})

test('should get past diffs', async () => {
  let diffs = await g.getPastDiffs()
  expect(diffs).toHaveLength(1)
  expect(diffs[0]).toBe('zdpuAsMGZ67AjBfzYY8UipuNmwpRnmfbXuh5cjacMeqTF9Y9H')
})

test('should instantiate with specific version', async () => {
  let g0 = new Graph(web3, contract, 0)

  let v = await g0.version()
  expect(v).toBe(0)

  let r = await g0.root()
  expect(r).toBe(rootHashes[0])
})
