import CID from 'cids'

import Dag from './dag'
import { ipfsMock, testCID } from 'ipfs'

let d = new Dag(ipfsMock)

beforeEach(() => {
  ipfsMock.dag.get.mockClear()
  ipfsMock.dag.put.mockClear()
  d._cacheClear()
})

test('should instantiate', () => {
  let d = new Dag(null)
  expect(d.ipfs).toBeNull()
  expect(d.cache).toEqual({})
})

test('should get response from ipfs', async () => {
  let cid = 'cid'
  let res = await d.get(cid)

  expect(ipfsMock.dag.get).toHaveBeenCalledTimes(1)
  expect(ipfsMock.dag.get).toHaveBeenCalledWith(cid)
  expect(res).toEqual({})
})

test('should return null if get failed', async () => {
  let cid = 'cid'
  ipfsMock.dag.get.mockImplementationOnce(() => new Promise((resolve, reject) => reject(new Error('error'))))

  let res = await d.get(cid)

  expect(ipfsMock.dag.get).toHaveBeenCalledTimes(1)
  expect(ipfsMock.dag.get).toHaveBeenCalledWith(cid)
  expect(res).toBeNull()
})

test('should cache successful fetches', async () => {
  let cid = 'cid'

  await d.get(cid)
  let [val, ok] = d._cacheGet(cid)

  expect(ok).toEqual(true)
  expect(val).toEqual({})
})

test('should return null when merging empty object', async () => {
  let res = await d.merge('cid', {})
  expect(res).toBeNull()
})

test('should put value', async () => {
  let res = await d.put({ test: true })
  expect(ipfsMock.dag.put).toHaveBeenCalledTimes(1)
  expect(res).toEqual(testCID)
})

test('should merge shallow diff', async () => {
  let res = await d.merge('cid', { test: true })
  expect(res).toEqual(testCID)
})

test('should merge nested diff', async () => {
  let cid = 'zdpuAyTBnYSugBZhqJuLsNpzjmAjSmxDqBbtAqXMtsvxiN2v3'
  let cid2 = 'zdpuAyTBnYSugBZhqJuLsNpzjmAjSmxDqBbtAqXMtsvxiN2v4'
  ipfsMock.dag.put = jest
    .fn()
    .mockImplementationOnce(() => new CID(cid))
    .mockImplementationOnce(() => new CID(cid2))

  let res = await d.merge('cid', { test: { nested: true } })
  expect(res).toEqual(cid2)

  let [val, ok] = d._cacheGet(cid2)
  expect(ok).toEqual(true)
  expect(val).toEqual({
    test: {
      '/': cid
    }
  })
})
