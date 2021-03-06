'use strict'

export default class Dag {
  constructor (ipfs) {
    this.ipfs = ipfs
    this.cache = {}
    this.cacheSize = 256
  }

  async get (cid) {
    let [val, ok] = this._cacheGet(cid)
    if (ok) {
      return val
    }

    try {
      let res = await this.ipfs.dag.get(cid)
      this._cacheSet(cid, res.value)
      return res.value
    } catch (e) {
      return null
    }
  }

  async put (obj) {
    let cid = (await this.ipfs.dag.put(obj, { format: 'dag-cbor', hashAlg: 'sha2-256' })).toBaseEncodedString()
    this._cacheSet(cid, obj)
    return cid
  }

  async merge (path, diff) {
    if (Object.keys(diff).length === 0) {
      return null
    }

    return this._traverse(path, diff)
  }

  async _traverse (path, obj) {
    if (Object.keys(obj).length === 0) {
      return null
    }

    let cur = await this.get(path) || {}
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

    let cid = await this.put(cur)
    return cid
  }

  _cacheGet (cid) {
    if (cid in this.cache) {
      return [this.cache[cid], true]
    }

    return [null, false]
  }

  _cacheSet (cid, v) {
    // TODO: Round-robin like cache expiration
    if (this.cache.length >= this.cacheSize) {
      this.cache = {}
    }

    this.cache[cid] = v
  }

  _cacheClear () {
    this.cache = {}
  }
}
