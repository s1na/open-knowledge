'use strict'

import Dag from './dag'

export default class Store {
  constructor(ipfs, repo) {
    this.ipfs = ipfs
    this._repoCid = repo
    this._graphs = {}
    this._size = null
    this.state = null
    this.dag = new Dag(ipfs, repo)
  }

  async init() {
    this.state = await this.dag.get(this._repoCid)
    if (!this.state) {
      throw new Error('Failed to fetch root state')
    }

    console.log('Fetched root state: ', this.state)
  }

  async addGraph(name) {
    if (name in this.state.graphs) {
      console.log('Graph already exists, skipping creation')
      return
    }

    let emptyObjCid = (await this.dag.put({})).toBaseEncodedString()

    let graph = {
      spo: { '/': emptyObjCid },
      sop: { '/': emptyObjCid },
      pso: { '/': emptyObjCid },
      pos: { '/': emptyObjCid },
      osp: { '/': emptyObjCid },
      ops: { '/': emptyObjCid },
    }

    await this._updateGraph(name, graph)
  }

  async addQuad(s, p, o, g) {
    // IPLD links should not contain special chars like /
    s = encodeURIComponent(s)
    p = encodeURIComponent(p)
    o = encodeURIComponent(o)
    g = encodeURIComponent(g)

    if (!(g in this.state.graphs)) {
      throw new Error('Graph does not exist')
    }

    let graph = await this.dag.get(this._repoCid + '/graphs/' + g)
    console.log(graph)

    let { existed, cid: spo } = await this._addToIndex(this._repoCid + '/graphs/' + g + '/spo', s, p, o)
    if (existed) {
      return
    }

    let { cid: sop } = await this._addToIndex(this._repoCid + '/graphs/' + g + '/sop', s, o, p)
    let { cid: pso } = await this._addToIndex(this._repoCid + '/graphs/' + g + '/pso', p, s, o)
    let { cid: pos } = await this._addToIndex(this._repoCid + '/graphs/' + g + '/pos', p, o, s)
    let { cid: osp } = await this._addToIndex(this._repoCid + '/graphs/' + g + '/osp', o, s, p)
    let { cid: ops } = await this._addToIndex(this._repoCid + '/graphs/' + g + '/ops', o, p, s)

    graph = {
      sop: { '/': sop },
      spo: { '/': spo },
      pso: { '/': pso },
      pos: { '/': pos },
      osp: { '/': osp },
      ops: { '/': ops },
    }
    console.log(graph)

    await this._updateGraph(g, graph)

    this._size = null
  }

  async addQuads(quads) {
    for (var i = 0; i < quads.length; i++) {
      this.addQuad(quads[i])
    }
  }

  // Adds a quad to a three-layered index.
  async _addToIndex(path, key0, key1, key2) {
    // Create layers as necessary
    // let index1 = index0[key0] || (index0[key0] = {})
    // let index2 = index1[key1] || (index1[key1] = {})
    let index0 = await this.dag.get(path)
    let index1, index2
    if (key0 in index0) {
      index1 = await this.dag.get(path + '/' + key0)
    } else {
      index1 = (index0[key0] = {})
    }

    if (key1 in index1) {
      index2 = await this.dag.get(path + '/' + key0 + '/' + key1)
    } else {
      index2 = (index1[key1] = {})
    }

    // Setting the key to _any_ value signals the presence of the quad
    let existed = key2 in index2
    if (!existed) {
      index2[key2] = true
      let cid2 = (await this.dag.put(index2)).toBaseEncodedString()
      index1[key1] = { '/': cid2 }
      let cid1 = (await this.dag.put(index1)).toBaseEncodedString()
      index0[key0] = { '/': cid1 }
      let cid0 = (await this.dag.put(index0)).toBaseEncodedString()
      return { existed: false, cid: cid0 }
    }

    return { existed: true, cid: null }
  }

  async _updateGraph(name, obj) {
    let cid = (await this.dag.put(obj)).toBaseEncodedString()
    this.state.graphs[name] = { '/': cid }
    this._repoCid = (await this.dag.put(this.state)).toBaseEncodedString()
    console.log('Updated graph ', name, '. New root: ', this._repoCid)
  }

  size() {
    let size = this._size;
    if (size !== null) {
      return size;
    }

    // Calculate the number of quads by counting to the deepest level
    size = 0;
    var graphs = this._graphs, subjects, subject;
    for (let graphKey in graphs) {
      for (let subjectKey in (subjects = graphs[graphKey].subjects)) {
        for (let predicateKey in (subject = subjects[subjectKey])) {
          size += Object.keys(subject[predicateKey]).length;
        }
      }
    }

    return this._size = size;
  }
}
