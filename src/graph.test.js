import Ganache from 'ganache-core'
import Web3 from 'web3'

import Graph from './graph'
import GraphContract from '../build/contracts/Graph.json'

const provider = Ganache.provider({})
const web3 = new Web3(provider)
let contract
let accounts
let g
let rootUpdatedMock = jest.fn()

beforeAll(async () => {
  accounts = await web3.eth.getAccounts()
  let abi = GraphContract.abi
  let bytecode = GraphContract.bytecode
  let graphContract = new web3.eth.Contract(abi)
  let gas = await graphContract.deploy({ data: bytecode, arguments: [accounts[0]] }).estimateGas({ from: accounts[0] })
  contract = await graphContract.deploy({ data: bytecode, arguments: [accounts[0]] }).send({ from: accounts[0], gas })
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

test('should have default root', async () => {
  let r = await g.root()
  expect(r).toBe('zdpuAmKRXTRNSgwSgXqPDP2FuxVeduNMtM113oGDeUDEoKuA1')
})

test('should set new root', async () => {
  let n = 'zdpuAyTBnYSugBZhqJuLsNpzjmAjSmxDqBbtAqXMtsvxiN2v3'
  let tx = await g.setRoot(n)
  expect(tx).not.toBe(null)
  expect(tx).toHaveProperty('events.RootUpdated.returnValues.root')
  expect(rootUpdatedMock).toHaveBeenCalledTimes(1)
  expect(rootUpdatedMock).toHaveBeenCalledWith(n)

  let r = await g.root()
  expect(r).toBe(n)
})

test('should get past roots', async () => {
  let roots = await g.getPastRoots()
  expect(roots).toHaveLength(1)
  expect(roots[0]).toBe('zdpuAyTBnYSugBZhqJuLsNpzjmAjSmxDqBbtAqXMtsvxiN2v3')
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
