export const getMock = jest.fn(value => new Promise((resolve, reject) => resolve({ value })))
export const putMock = jest.fn()
export const ipfsMock = {
  dag: {
    get: getMock,
    put: putMock
  }
}
