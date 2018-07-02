import IPLDResolver from 'ipld'
import CID from 'cids'

class Dag {
  async init () {
    this.ipld = await this.createIpld()
  }

  createIpld () {
    return new Promise((resolve, reject) => {
      IPLDResolver.inMemory((err, ipld) => {
        if (err !== null) reject(err)
        resolve(ipld)
      })
    })
  }

  async put (node, options = { format: 'dag-cbor', hashAlg: 'sha2-256' }) {
    return new Promise((resolve, reject) => {
      this.ipld.put(node, options, (err, cid) => {
        if (err !== null) reject(err)
        resolve(cid)
      })
    })
  }

  async get (cid) {
    return new Promise((resolve, reject) => {
      let path
      let options = {}
      if (typeof cid === 'string') {
        const split = cid.split('/')
        cid = new CID(split[0])
        split.shift()

        if (split.length > 0) {
          path = split.join('/')
        } else {
          path = '/'
        }
      } else if (Buffer.isBuffer(cid)) {
        try {
          cid = new CID(cid)
        } catch (err) {
          reject(err)
        }
      }

      this.ipld.get(cid, path, options, (err, data) => {
        if (err !== null) reject(err)
        resolve(data)
      })
    })
  }
}

export default {
  dag: new Dag()
}
