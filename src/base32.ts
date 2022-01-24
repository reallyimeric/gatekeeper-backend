export function encode(input: Buffer | string): string {
  const raw = typeof input === 'string' ? Buffer.from(input) : input
  const size = 5
  let result = ''
  let finished = false
  let bitsAlreadyConsumed = 0;
  let highBits = 0
  let isFirstSegment = true
  let resultCount = 0
  function processSegment(segment: Buffer, paddingMode = false) {
    // avoid reading from a zero size buffer
    if (segment.length !== 0) {
      // prepare for the first time
      if (isFirstSegment) {
        highBits = segment.readUInt8();
        isFirstSegment = false
      }
      // loop bytes
      for (let offset = 0; offset !== segment.length; offset++) {
        let lowBits = 0
        let breakOnEnd = false
        try {
          lowBits = segment.readUInt8(offset + 1)
        } catch (e) {
          // reserve current states for new segments
          // bypass padding mode
          if (e instanceof RangeError && !paddingMode) breakOnEnd = true
        }
        // inner loop until bitsAlreadyConsumed >= 8
        while (bitsAlreadyConsumed < 8) {
          const bitsLeftOnHighBits = 8 - bitsAlreadyConsumed
          if (bitsLeftOnHighBits >= size) {
            const value = highBits >> bitsLeftOnHighBits - size & 0b00011111
            result += encodeBits(value)
            resultCount += 1
            if (resultCount === 8) resultCount = 0
          } else {
            if (breakOnEnd) break
            const value = ((highBits & 2 ** bitsLeftOnHighBits - 1) << size - bitsLeftOnHighBits) + (lowBits >> 8 - (size - bitsLeftOnHighBits))
            result += encodeBits(value)
            resultCount += 1
            if (resultCount === 8) resultCount = 0
          }
          bitsAlreadyConsumed += size;
        }
        // we don't want this if we come here by break
        if (bitsAlreadyConsumed >= 8) {
          bitsAlreadyConsumed -= 8;
          highBits = lowBits
        }
        if (paddingMode) {
          [...Array(8 - resultCount).keys()].forEach(() => result += '=')
          return
        }
      }
    }
    // padding if finished
    if (finished) {
      if (bitsAlreadyConsumed === 0) return
      processSegment(Buffer.from([0]), true)
    }
  }

  finished = true
  processSegment(raw)
  return result
}

export function decode(input: string): Buffer {
  return Buffer.from('')
}

function encodeBits(v: number): string {
  if (v <= 25) return String.fromCodePoint(v + 65)
  return `${v - 24}`
}

function decodeBits(e: string): number {
  if (/\d/.test(e)) {
    return +e + 24
  } else {
    return e.codePointAt(0)! - 65
  }
}
