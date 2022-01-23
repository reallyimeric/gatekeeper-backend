const { encode, decode } = require('../src/base32')
const assert = require('assert/strict')

const expectedDataList = ['', 'f', 'fo', 'foo', 'foob', 'fooba', 'foobar']
const expectedEncodedList = [
  '',
  'MY======',
  'MZXQ====',
  'MZXW6===',
  'MZXW6YQ=',
  'MZXW6YTB',
  'MZXW6YTBOI======',]
assert(expectedDataList.length === expectedEncodedList.length, 'data count not match')

describe('base32', function () {
  it('encode correctly', function () {
    const encodedList = expectedDataList.map(data => encode(data))
    const matched = encodedList.every((encoded, index) => encoded === expectedEncodedList[index])
    expect(matched).toBe(true);
  })
  it('decode correctly', function () {
    const decodedList = expectedEncodedList.map(data => decode(data))
    const matched = decodedList.every((decoded, index) => Buffer.from(expectedDataList[index]).equals(decoded))
    expect(matched).toBe(true);
  })
})
