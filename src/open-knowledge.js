'use strict'

import N3 from 'n3'
import { Parser as SparqlParser } from 'sparqljs'

import GraphManager from './graph-manager'
import FederatedFragmentsClient from './federated-fragments-client'
import SparqlIterator from './ldf/sparql/SparqlIterator'

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

  async getTriples (s, p, o, graph = 'default', offset = 0, limit = 10) {
    let g = await this.getGraphManager(graph)
    if (g === null) {
      console.log('Graph', g, 'not found')
      return []
    }

    return g.getTriples(s, p, o, offset, limit)
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

  executeFederated (query, graphs = ['default']) {
    return new Promise(async (resolve, reject) => {
      let managers = []
      for (let i = 0; i < graphs.length; i++) {
        let manager = await this.getGraphManager(graphs[i])
        if (manager === null) {
          throw new Error('Graph manager not found')
        }

        managers.push(manager)
      }

      let fragmentsClient = new FederatedFragmentsClient(managers)
      let stream = new SparqlIterator(query, { fragmentsClient })
      let results = []

      stream.on('data', (res) => { results.push(res) })
      stream.on('end', () => { resolve(results) })
      stream.on('error', (err) => { reject(err) })
    })
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

  parse (doc) {
    return new Promise((resolve, reject) => {
      const parser = N3.Parser()
      let triples = []

      parser.parse(doc, (err, quad, prefixes) => {
        if (err) {
          return reject(err)
        }

        if (quad === null) {
          return resolve(triples)
        }

        triples.push([quad.subject.value, quad.predicate.value, quad.object.value])
      })
    })
  }
}
