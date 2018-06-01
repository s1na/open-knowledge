'use strict'

import { SparqlIterator } from 'ldf-client'
import CID from 'cids'

import Store from './store'
import FragmentsClient from './fragments-client'

export default class OpenKnowledge {
  constructor(ipfs, graphManager) {
    this.ipfs = ipfs
    this.graphManager = graphManager
  }

  async init() {
    let rootHex = await this.graphManager.methods.root().call()
    let rootCid = new CID('f' + rootHex.slice(2))
    this.store = new Store(this.ipfs, rootCid.toBaseEncodedString())
    await this.store.init()
  }

  addTriple(s, p, o, g) {
    return this.store.addTriple(s, p, o, g)
  }

  async execute(q) {
    let fragmentsClient = new FragmentsClient(this.store)
    //let fragmentsClient = new ldf.FragmentsClient('http://fragments.dbpedia.org/2015/en')
    let results = new SparqlIterator(q, { fragmentsClient })
    results.on('data', (res) => { console.log('here comes res:', res) })
  }
}
