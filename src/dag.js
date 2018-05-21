'use strict'

export default class Store {
  constructor(ipfs, repo) {
    this.ipfs = ipfs
    this.root = repo
  }
 
  async get(cid) {
    let res = await this.ipfs.dag.get(cid)
    return res.value
  }

  async put(obj) {
    return this.ipfs.dag.put(obj, { format: 'dag-cbor', hashAlg: 'sha2-256' })
  }
}
