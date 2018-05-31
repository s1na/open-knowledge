'use strict'

import { SparqlIterator } from 'ldf-client'

import Store from './store'
import FragmentsClient from './fragments-client'

export default class OpenKnowledge {
  constructor(ipfs, repo) {
    this.store = new Store(ipfs, repo)
  }

  async init() {
    await this.store.init()
  }

  async add(k, v) {
    return this.store.add(k, v)
  }

  async get(k) {
    return this.store.get(k)
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
