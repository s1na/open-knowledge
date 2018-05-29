'use strict'

import Store from './store'

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
}
