'use strict'

import SparqlIterator from './ldf/sparql/SparqlIterator'

import Store from './store'
import FragmentsClient from './fragments-client'

export default class GraphManager {
  constructor (ipfs, graph) {
    this.ipfs = ipfs
    this.graph = graph
  }

  async init () {
    let root = await this.graph.root()
    this.store = new Store(this.ipfs, root)
    this.graph.onRootUpdated((r) => this.store.setRoot(r))
  }

  async addTriples (triples, submitDiff = false) {
    if (!this.graph.isOwner()) {
      console.log('Coinbase account does not own Graph contract')
      return null
    }

    if (this.graph.v !== null) {
      console.log('Adding triples to previous graph versions is not supported')
      return null
    }

    let newRoot
    if (submitDiff) {
      let diff = await this.store.computeDiff(triples)
      let diffCid = await this.store.putDiff(diff)
      let diffTx = await this.graph.setDiff(diffCid)
      if (diffTx === null) {
        console.log('Failed to submit diff to graph contract')
        return null
      }

      newRoot = await this.store.mergeDiff(diff)
    } else {
      newRoot = await this.store.addTriples(triples)
    }

    if (newRoot === null) {
      return null
    }

    let tx = await this.graph.setRoot(newRoot)
    return tx
  }

  getTriples (s, p, o, offset = 0, limit = 10) {
    return this.store.getTriples(s, p, o, offset, limit)
  }

  execute (q) {
    return new Promise((resolve, reject) => {
      let fragmentsClient = new FragmentsClient(this.store)
      let stream = new SparqlIterator(q, { fragmentsClient })
      let results = []

      stream.on('data', (res) => { results.push(res) })
      stream.on('end', () => { resolve(results) })
      stream.on('error', (err) => { reject(err) })
    })
  }
}
