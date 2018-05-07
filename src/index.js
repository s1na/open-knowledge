'use strict'

export default class OpenKnowledge {
  constructor(orbitdb) {
    this.orbitdb = orbitdb 
  }

  async init() {
    this.kvstore = await this.orbitdb.keyvalue('openknowledge.kv')
    // this.logstore = await orbitdb.log('OpenKnowledge.log')
  }

  async add(k, v) {
    return this.kvstore.put(k, v)
  }

  async get(k) {
    return this.kvstore.get(k)
  }
}
