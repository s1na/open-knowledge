'use strict'

export default class Store {
  constructor(ipfs, repo) {
    this.ipfs = ipfs
    this._repoCid = repo
    this._graphs = {}
    this._size = null
    this.state = null
  }

  async init() {
    ({ value: this.state } = await this.ipfs.dag.get(this._repoCid))
    console.log('Fetched root state: ', this.state)
  }

  async addGraph(name) {
    if (name in this.state.graphs) {
      console.log('Graph already exists, skipping creation')
      return
    }

    let graph = {
      subjects: {},
      predicates: {},
      objects: {},
    }

    let cid = await this.ipfs.dag.put(graph, { format: 'dag-cbor', hashAlg: 'sha2-256' })
    this.state.graphs[name] = { '/': cid.toBaseEncodedString() }
    let rootCid = await this.ipfs.dag.put(this.state, { format: 'dag-cbor', hashAlg: 'sha2-256' })
    rootCid = rootCid.toBaseEncodedString()
    this._repoCid = rootCid
    console.log('Added graph, rootcid is now ', rootCid)
  }

  async addQuad(s, p, o, g) {
    if (!(g in this.state.graphs)) {
      throw new Error('Graph does not exist')
    }

    // IPLD links should not contain special chars like /
    s = encodeURIComponent(s)
    p = encodeURIComponent(p)
    o = encodeURIComponent(o)

    let { value: graph } = await this.ipfs.dag.get(this._repoCid + '/graphs/' + g)
    console.log(graph)

    let changed = await this._addToIndex(this._repoCid + '/graphs/' + g + '/subjects', graph.subjects, s, p, o)
    await this._addToIndex(this._repoCid + '/graphs/' + g + '/predicates', graph.predicates, p, o, s)
    await this._addToIndex(this._repoCid + '/graphs/' + g + '/objects', graph.objects, o, s, p)

    console.log(graph)

    if (changed) {
      let cid = await this.ipfs.dag.put(graph, { format: 'dag-cbor', hashAlg: 'sha2-256' })
      this.state.graphs[g] = { '/': cid.toBaseEncodedString() }
      let rootCid = await this.ipfs.dag.put(this.state, { format: 'dag-cbor', hashAlg: 'sha2-256' })
      rootCid = rootCid.toBaseEncodedString()
      this._repoCid = rootCid
      console.log('Added quad, new root cid: ', rootCid)
    }

    this._size = null
  }

  // Adds a quad to a three-layered index.
  async _addToIndex(path, index0, key0, key1, key2) {
    // Create layers as necessary
    // let index1 = index0[key0] || (index0[key0] = {})
    // let index2 = index1[key1] || (index1[key1] = {})
    let index1, index2
    if (key0 in index0) {
      ({ value: index1 } = await this.ipfs.dag.get(path + '/' + key0))
    } else {
      index1 = (index0[key0] = {})
    }

    if (key1 in index1) {
      ({ value: index2 } = await this.ipfs.dag.get(path + '/' + key0 + '/' + key1))
    } else {
      index2 = (index1[key1] = {})
    }

    // Setting the key to _any_ value signals the presence of the quad
    let existed = key2 in index2
    if (!existed) {
      index2[key2] = true
      let cid2 = await this.ipfs.dag.put(index2, { format: 'dag-cbor', hashAlg: 'sha2-256' })
      index1[key1] = { '/': cid2.toBaseEncodedString() }
      let cid1 = await this.ipfs.dag.put(index1, { format: 'dag-cbor', hashAlg: 'sha2-256' })
      index0[key0] = { '/': cid1.toBaseEncodedString() }
    }

    return !existed
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
