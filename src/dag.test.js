import Dag from './dag'
import { ipfsMock } from 'ipfs'

beforeEach(() => {
  ipfsMock.dag.get.mockClear()
  ipfsMock.dag.put.mockClear()
})

test('should instantiate', () => {
  let d = new Dag(null)
  expect(d.ipfs).toBeNull()
  expect(d.cache).toEqual({})
})

test('should get response from ipfs', async () => {
  let cid = 'cid'
  let d = new Dag(ipfsMock)
  let res = await d.get(cid)

  expect(ipfsMock.dag.get).toHaveBeenCalledTimes(1)
  expect(ipfsMock.dag.get).toHaveBeenCalledWith(cid)
  expect(res).toEqual(cid)
})

test('should return null if get failed', async () => {
  let cid = 'cid'
  ipfsMock.dag.get.mockImplementationOnce(() => new Promise((resolve, reject) => reject(new Error('error'))))

  let d = new Dag(ipfsMock)
  let res = await d.get(cid)

  expect(ipfsMock.dag.get).toHaveBeenCalledTimes(1)
  expect(ipfsMock.dag.get).toHaveBeenCalledWith(cid)
  expect(res).toBeNull()
})

test('should cache successful fetches', async () => {
  let cid = 'cid'

  let d = new Dag(ipfsMock)
  await d.get(cid)
  let [val, ok] = d._cacheGet(cid)

  expect(ok).toEqual(true)
  expect(val).toEqual(cid)
})
