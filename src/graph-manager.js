'use strict'

import SparqlIterator from './ldf/sparql/SparqlIterator'
import CID from 'cids'

import Store from './store'
import FragmentsClient from './fragments-client'

export default class GraphManager {
  constructor(ipfs, web3, contract) {
    this.ipfs = ipfs
    this.web3 = web3
    this.contract = contract
    this.rootUpdatedSub = null
  }

  async init() {
    let root = await this._fetchRoot()
    this.store = new Store(this.ipfs, root)

    this.rootUpdatedSub = this.contract.events.RootUpdated()
    this.rootUpdatedSub.on('data', (ev) => {
      this.store.setRoot(this._rootCIDFromHex(ev.returnValues.root))
    })
  }

  async addTriples(triples) {
    let coinbase = await this.web3.eth.getCoinbase()
    let owner = await this.contract.methods.owner().call()
    if (coinbase.toLowerCase() !== owner.toLowerCase()) {
      console.log('Coinbase account does not own GraphManager contract')
      return null
    }

    let newRoot = await this.store.addTriples(triples)
    if (newRoot === null) {
      return null
    }

    console.log(newRoot)
    let tx = null
    let hex = this._cidToHex(newRoot)
    try {
      tx = await this.contract.methods.setRoot(hex).send({ from: coinbase })
    } catch (e) {
      console.log(e)
      return null
    }

    return tx
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

  _rootCIDFromHex(h) {
    let c = new CID('f' + h.slice(2))
    return c.toBaseEncodedString()
  }

  _cidToHex(s) {
    let c = new CID(s)
    let h = c.toBaseEncodedString('base16')
    return '0x' + h.slice(1)
  }
}
