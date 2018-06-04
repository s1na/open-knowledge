'use strict'

import _ from 'lodash'

import Dag from './dag'

export default class Store {
  constructor(ipfs, repo) {
    this.ipfs = ipfs
    this._repoCid = repo
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

  async setRoot(r) {
    this._repoCid = r
    await this.init()
  }

  size() {
    return this.state.size
  }

  async addGraph(name) {
    if (name in this.state.graphs) {
      console.log('Graph already exists, skipping creation')
      return
    }

    let emptyObjCid = await this.dag.put({})

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

  async seqAddTriples(quads) {
    for (var i = 0; i < quads.length; i++) {
      await this.addQuad(...quads[i])
    }
  }

  async addTriples(triples, g) {
    ({ g } = this._sanitizeQuad(null, null, null, g))

    if (!(g in this.state.graphs)) {
      throw new Error('Graph ' + g + ' does not exist')
    }

    let diff = { spo: {}, sop: {}, pso: {}, pos: {}, osp: {}, ops: {} }
    for (let i in triples) {
      let triple = triples[i]
      let { s, p, o } = this._sanitizeQuad(triple[0], triple[1], triple[2], g)

      // Skip if exists
      let item = await this.dag.get(this._repoCid + '/graphs/' + g + '/spo/' + s + '/' + p)
      if (item !== null && o in item) {
        console.log('triple exists, skipping')
        continue
      }

      this._addToDiff(diff.spo, s, p, o)
      this._addToDiff(diff.sop, s, o, p)
      this._addToDiff(diff.pso, p, s, o)
      this._addToDiff(diff.pos, p, o, s)
      this._addToDiff(diff.osp, o, s, p)
      this._addToDiff(diff.ops, o, p, s)
    }

    let cid = await this.dag.merge(this._repoCid + '/graphs/' + g, diff)
    if (cid === null) {
      return
    }

    this.state.graphs[g] = { '/': cid }
    this._repoCid = await this.dag.put(this.state)
    console.log('Updated graph ', g, '. New root: ', this._repoCid)
  }

  async addTriple(s, p, o, g) {
    // IPLD links should not contain special chars like /
    ({ s, p, o, g } = this._sanitizeQuad(s, p, o, g))

    if (!(g in this.state.graphs)) {
      throw new Error('Graph ' + g + ' does not exist')
    }

    let { existed, cid: spo } = await this._addToIndex(this._repoCid + '/graphs/' + g + '/spo', s, p, o)
    if (existed) {
      console.log('Quad already exists, skipping')
      return
    }

    let { cid: sop } = await this._addToIndex(this._repoCid + '/graphs/' + g + '/sop', s, o, p)
    let { cid: pso } = await this._addToIndex(this._repoCid + '/graphs/' + g + '/pso', p, s, o)
    let { cid: pos } = await this._addToIndex(this._repoCid + '/graphs/' + g + '/pos', p, o, s)
    let { cid: osp } = await this._addToIndex(this._repoCid + '/graphs/' + g + '/osp', o, s, p)
    let { cid: ops } = await this._addToIndex(this._repoCid + '/graphs/' + g + '/ops', o, p, s)

    let graph = {
      sop: { '/': sop },
      spo: { '/': spo },
      pso: { '/': pso },
      pos: { '/': pos },
      osp: { '/': osp },
      ops: { '/': ops },
    }

    await this._updateGraph(g, graph)

    this.state.size++
    this._repoCid = await this.dag.put(this.state)
    console.log('New root: ', this._repoCid)
  }

  async getTriples(s, p, o, g, offset=0, limit=10) {
    ({ s, p, o, g } = this._sanitizeQuad(s, p, o, g))

    if (!(g in this.state.graphs)) {
      throw new Error('Failed to get graph')
    }

    let els = { s, p, o }
    let variable = []
    let fixed = []
    let fixedEls = {}

    for (let k in els) {
      if (els[k] === null) {
        variable.push(k)
      } else {
        fixed.push(k)
        fixedEls[k] = els[k]
      }
    }

    let iname = fixed.join('') + variable.join('')
    let path = this._repoCid + '/graphs/' + g + '/' + iname
    for (let k in fixed) {
      path += '/' + fixedEls[fixed[k]]
    }

    let res = await this._loopIndex(path, fixedEls, variable)
    return res.slice(offset, limit)
  }

  async _loopIndex(path, fixed, variable) {
    if (variable.length === 0) {
      return [this._decodeTriple(fixed.s, fixed.p, fixed.o)]
    }

    let res = []
    console.log('getting index ', path)
    let index = await this.dag.get(path)
    let keys = Object.keys(index)
    keys = _.sortBy(keys)
    for (let i = 0; i < keys.length; i++) {
      let k = keys[i]
      let r = await this._loopIndex(
        path + '/' + k,
        Object.assign({}, fixed, { [variable[0]]: k }),
        variable.slice(1),
      )

      res = res.concat(r)
    }

    return res
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
      let cid2 = await this.dag.put(index2)
      index1[key1] = { '/': cid2 }
      let cid1 = await this.dag.put(index1)
      index0[key0] = { '/': cid1 }
      let cid0 = await this.dag.put(index0)
      return { existed: false, cid: cid0 }
    }

    return { existed: true, cid: null }
  }

  async _updateGraph(name, obj) {
    let cid = await this.dag.put(obj)
    this.state.graphs[name] = { '/': cid }
    this._repoCid = await this.dag.put(this.state)
    console.log('Updated graph ', name, '. New root: ', this._repoCid)
  }

  _addToDiff(i0, k0, k1, k2) {
    let i1 = i0[k0] || (i0[k0] = {})
    let i2 = i1[k1] || (i1[k1] = {})
    i2[k2] = true
  }

  _sanitizeQuad(s, p, o, g) {
    s = typeof s === 'string' ? encodeURIComponent(s) : s
    p = typeof p === 'string' ? encodeURIComponent(p) : p
    o = typeof o === 'string' ? encodeURIComponent(o) : o
    g = typeof g === 'string' ? encodeURIComponent(g) : g

    return { s, p, o, g }
  }

  _decodeTriple(s, p, o) {
    s = decodeURIComponent(s)
    p = decodeURIComponent(p)
    o = decodeURIComponent(o)

    return [s, p, o]
  }
}
