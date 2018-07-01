'use strict'

import { Parser as SparqlParser } from 'sparqljs'

import GraphManager from './graph-manager'

export default class OpenKnowledge {
  constructor (ipfs, registry) {
    this.ipfs = ipfs
    this.registry = registry
    this.graphManagers = {}
    this.emptyGraphCid = 'zdpuAmKRXTRNSgwSgXqPDP2FuxVeduNMtM113oGDeUDEoKuA1'
    this.emptyObjCid = 'zdpuAyTBnYSugBZhqJuLsNpzjmAjSmxDqBbtAqXMtsvxiN2v3'
  }

  async init () {
    this.graphManagers.default = await this.getGraphManager('default')
  }

  async getGraphManager (name) {
    if (name in this.graphManagers) {
      return this.graphManagers[name]
    }

    let graph = await this.registry.getGraph(name)
    if (graph === null) {
      return null
    }

    let manager = new GraphManager(this.ipfs, graph)
    this.graphManagers[name] = manager
    await manager.init()

    return manager
  }

  async newGraphManager (name) {
    let manager = await this.getGraphManager(name)
    if (manager !== null) {
      return manager
    }

    let graph = await this.registry.newGraph(name)
    if (graph === null) {
      return null
    }

    manager = new GraphManager(this.ipfs, graph)
    this.graphManagers[name] = manager
    await manager.init()

    return manager
  }

  async addTriples (triples, graph = 'default') {
    let g = await this.getGraphManager(graph)
    if (g === null) {
      console.log('Graph', g, 'not found')
      return null
    }

    return g.addTriples(triples)
  }

  async execute (query) {
    let graph = 'default'
    let parser = new SparqlParser()
    let q = parser.parse(query)
    if ('from' in q) {
      if (q.from.default.length === 0) {
        throw new Error('Invalid from in query')
      }

      let def = q.from.default[0]
      if (!def.startsWith('openknowledge:')) {
        throw new Error('Only from clauses with openknowledge scheme are allowed')
      }

      graph = def.substr('openknowledge:'.length)
    }

    let g = await this.getGraphManager(graph)
    if (g === null) {
      console.log('Graph', g, 'not found')
      return null
    }

    return g.execute(query)
  }

  async getGraphs () {
    let res = {}
    let names = await this.registry.getGraphs()

    for (let i = 0; i < names.length; i++) {
      let name = names[i]
      let manager = await this.getGraphManager(name)
      res[name] = manager
    }

    return res
  }
}
