import CID from 'cids'

export const testCID = 'zdpuAyTBnYSugBZhqJuLsNpzjmAjSmxDqBbtAqXMtsvxiN2v3'

export const getMock = jest.fn(() => new Promise((resolve, reject) => resolve({ value: {} })))
export const putMock = jest.fn(() => new CID(testCID))

export const ipfsMock = {
  dag: {
    get: getMock,
    put: putMock
  }
}
