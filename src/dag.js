'use strict'

export default class Store {
  constructor(ipfs, repo) {
    this.ipfs = ipfs
    this.root = repo
  }
 
  async get(cid) {
    try {
      let res = await this.ipfs.dag.get(cid)
      return res.value
    } catch (e) {
      return null
    }
  }

  async put(obj) {
    return (await this.ipfs.dag.put(obj, { format: 'dag-cbor', hashAlg: 'sha2-256' })).toBaseEncodedString()
  }

  async merge(path, diff) {
    console.log(path, JSON.stringify(diff, null, '\t'))
    if (Object.keys(diff).length === 0) {
      return null
    }

    return this._traverse(path, diff)
  }

  async _traverse(path, obj) {
    if (Object.keys(obj).length === 0) {
      return null
    }

    let cur = await this.get(path) || {}
    console.log('entering', path, 'cur', cur, 'obj', obj)
    for (let k in obj) {
      if (typeof obj[k] !== 'object') {
        cur = Object.assign({}, cur, obj)
        break
      }

      let ccid = await this._traverse(path + '/' + k, obj[k])
      if (ccid === null) {
        continue
      }

      cur[k] = { '/': ccid }
    }

    console.log('putting', cur)
    let cid = await this.put(cur)
    console.log('got cid', cid)
    return cid
  }
}
