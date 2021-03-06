'use strict'

import AsyncIterator from 'asynciterator'

export default class FragmentsClient {
  constructor (store) {
    this.store = store
  }

  getFragmentByPattern (pattern) {
    let fragment = new Fragment()
    let s = pattern.subject[0] === '?' ? null : pattern.subject
    let p = pattern.predicate[0] === '?' ? null : pattern.predicate
    let o = pattern.object[0] === '?' ? null : pattern.object

    this.store.getTriples(s, p, o).then((res) => {
      fragment.setProperty('metadata', { totalTriples: res.length })
      for (let i = 0; i < res.length; i++) {
        let triple = { subject: res[i][0], predicate: res[i][1], object: res[i][2] }
        fragment._push(triple)
      }

      fragment.close()
    })

    return fragment
  }
}

class Fragment extends AsyncIterator.BufferedIterator {}
