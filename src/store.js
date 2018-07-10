'use strict'

import _ from 'lodash'

import Dag from './dag'

export default class Store {
  constructor (ipfs, root) {
    this.root = root
    this.dag = new Dag(ipfs)
  }

  setRoot (r) {
    this.root = r
  }

  async addTriples (triples) {
    let diff = await this.computeDiff(triples)
    return this.mergeDiff(diff)
  }

  async getTriples (s, p, o, offset = 0, limit = 10) {
    ({ s, p, o } = this._sanitizeTriple(s, p, o))

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
    let path = this.root + '/' + iname
    for (let k in fixed) {
      path += '/' + fixedEls[fixed[k]]
    }

    let res = await this._loopIndex(path, fixedEls, variable)
    return res.slice(offset, limit)
  }

  async mergeDiff (diff) {
    let cid = await this.dag.merge(this.root, diff)
    if (cid === null) {
      console.log('merge failed')
      return null
    }

    if (this.root === cid) {
      console.log('cid same as root')
      return null
    }

    return cid
  }

  async computeDiff (triples) {
    let diff = { spo: {}, sop: {}, pso: {}, pos: {}, osp: {}, ops: {} }
    for (let i in triples) {
      let triple = triples[i]
      let { s, p, o } = this._sanitizeTriple(triple[0], triple[1], triple[2])

      // Skip if exists
      let item = await this.dag.get(this.root + '/spo/' + s + '/' + p)
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

    return diff
  }

  async putDiff (diff) {
    return this.dag.put(diff)
  }

  async _loopIndex (path, fixed, variable) {
    if (variable.length === 0) {
      return [this._decodeTriple(fixed.s, fixed.p, fixed.o)]
    }

    let res = []
    let index = await this.dag.get(path)
    if (index === null) {
      console.log('Index not found')
      return res
    }

    let keys = Object.keys(index)
    keys = _.sortBy(keys)
    for (let i = 0; i < keys.length; i++) {
      let k = keys[i]
      let r = await this._loopIndex(
        path + '/' + k,
        Object.assign({}, fixed, { [variable[0]]: k }),
        variable.slice(1)
      )

      res = res.concat(r)
    }

    return res
  }

  async _getState (path = this.root) {
    let state = await this.dag.get(path)

    for (let k in state) {
      if (typeof state[k] === 'object') {
        state[k] = await this.getState(path + '/' + k)
      }
    }

    return state
  }

  _addToDiff (i0, k0, k1, k2) {
    let i1 = i0[k0] || (i0[k0] = {})
    let i2 = i1[k1] || (i1[k1] = {})
    i2[k2] = true
  }

  _sanitizeTriple (s, p, o) {
    s = typeof s === 'string' ? encodeURIComponent(s) : s
    p = typeof p === 'string' ? encodeURIComponent(p) : p
    o = typeof o === 'string' ? encodeURIComponent(o) : o

    return { s, p, o }
  }

  _decodeTriple (s, p, o) {
    s = decodeURIComponent(s)
    p = decodeURIComponent(p)
    o = decodeURIComponent(o)

    return [s, p, o]
  }
}
