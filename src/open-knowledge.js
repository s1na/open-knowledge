'use strict'

import N3 from 'n3'
import { Parser as SparqlParser } from 'sparqljs'
import Web3 from 'web3'
import { TCR } from '../../../eth/tcr.js/dist/tcr.esm.js'

import GraphManager from './graph-manager'
import FederatedFragmentsClient from './federated-fragments-client'
import SparqlIterator from './ldf/sparql/SparqlIterator'
import Registry from './registry'

export default class OpenKnowledge {
  constructor (ipfs, provider, registryContract) {
    this.ipfs = ipfs
    this.provider = provider
    this.web3 = new Web3(provider)
    this.registryContract = registryContract
    this.tcr = new TCR(provider, registryContract)
    this.registry = new Registry(this.web3, this.tcr)
    this.graphManagers = {}
    this.emptyGraphCid = 'zdpuAmKRXTRNSgwSgXqPDP2FuxVeduNMtM113oGDeUDEoKuA1'
    this.emptyObjCid = 'zdpuAyTBnYSugBZhqJuLsNpzjmAjSmxDqBbtAqXMtsvxiN2v3'
  }

  async init () {
    await this.registry.init()
    this.web3.eth.defaultAccount = await this.web3.eth.getCoinbase()
  }

  async getGraphManager (name) {
    if (name in this.graphManagers) {
      return this.graphManagers[name]
    }

    let version = null
    let n = name
    let parts = name.split(':')
    if (parts.length === 2) {
      n = parts[0]
      version = parseInt(parts[1])
    }

    let graph
    try {
      graph = await this.registry.getGraph(n, version)
    } catch (e) {
      return null
    }

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

  async addTriples (triples, graph = 'default', submitDiff = false) {
    let g = await this.getGraphManager(graph)
    if (g === null) {
      console.log('Graph', g, 'not found')
      return null
    }

    return g.addTriples(triples, submitDiff)
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
