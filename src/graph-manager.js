'use strict'

import { SparqlIterator } from 'ldf-client'
import CID from 'cids'

import Store from './store'
import FragmentsClient from './fragments-client'

export default class GraphManager {
  constructor(ipfs, contract) {
    this.ipfs = ipfs
    this.contract = contract 
    this.rootUpdatedSub = null
  }

  async init() {
    let root = await this._fetchRoot()
    this.store = new Store(this.ipfs, root)
    await this.store.init()

    this.rootUpdatedSub = this.contract.events.RootUpdated()
    this.rootUpdatedSub.on('data', this._rootUpdated)
  }

  execute(q) {
    return new Promise((resolve, reject) => {
      let fragmentsClient = new FragmentsClient(this.store)
      let stream = new SparqlIterator(q, { fragmentsClient })
      let results = []

      stream.on('data', (res) => { results.push(res) })
      stream.on('end', () => { resolve(results) })
      stream.on('error', (err) => { reject(err) })
    })
  }

  async _fetchRoot() {
    let rootHex = await this.contract.methods.root().call()
    return this._rootCIDFromHex(rootHex)
  }

  _rootUpdated(ev) {
    this.store.setRoot(this._rootCIDFromHex(ev.returnValues.root))
  }

  _rootCIDFromHex(h) {
    let c = new CID('f' + h.slice(2))
    return c.toBaseEncodedString()
  }
}
