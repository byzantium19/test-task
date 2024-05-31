import { parseSSML, ssmlNodeToText } from './ssml'

// SSML -> SSMLNodes
describe('parseSSML', () => {
  /// Tags
  it('should parse tag names', () => {
    expect(parseSSML('<speak></speak>')).toEqual({
      name: 'speak',
      attributes: [],
      children: [],
    })
    expect(parseSSML('<speak><p></p></speak>')).toEqual({
      name: 'speak',
      attributes: [],
      children: [
        {
          name: 'p',
          attributes: [],
          children: [],
        },
      ],
    })
    expect(parseSSML('< speak   >< p ></  p ></speak >')).toEqual({
      name: 'speak',
      attributes: [],
      children: [
        {
          name: 'p',
          attributes: [],
          children: [],
        },
      ],
    })
  })

  it('should throw on missing speak tag', () => {
    expect(() => parseSSML('Hello world')).toThrow()
    expect(() => parseSSML('<p>Hello world</p>')).toThrow()
    expect(() => parseSSML('<p><speak>Hello world</speak></p>')).toThrow()
    expect(() => parseSSML('Hello <speak>world</speak>')).toThrow()
  })

  it('should throw on multiple top level tags or text', () => {
    expect(() => parseSSML('<speak>Hello world</speak><foo></foo>')).toThrow()
    expect(() => parseSSML('<speak>Hello world</speak>foo')).toThrow()
    expect(() => parseSSML('<foo></foo><speak>Hello world</speak>')).toThrow()
    expect(() => parseSSML('foo<speak>Hello world</speak>')).toThrow()
  })

  it('should throw on missing or invalid SSML opening and closing tags', () => {
    expect(() => parseSSML('<speak>Hello world')).toThrow()
    expect(() => parseSSML('Hello world</speak>')).toThrow()
    expect(() => parseSSML('<speak><p>Hello world</speak>')).toThrow()
    expect(() => parseSSML('<speak>Hello world</p></speak>')).toThrow()
    expect(() => parseSSML('<speak><p>Hello <s>world</s></speak>')).toThrow()
    expect(() => parseSSML('<speak><p>Hello <s>world</p></speak>')).toThrow()
    expect(() => parseSSML('<speak><p>Hello <s>world</p></p></speak>')).toThrow()
    expect(() => parseSSML('<speak><p>Hello world</s></speak>')).toThrow()
    expect(() => parseSSML('<speak><p>Hello world</p></p></speak>')).toThrow()
  })

  /// Attributes
  it('should parse tag attributes', () => {
    expect(parseSSML('<speak foo=""></speak>')).toEqual({
      name: 'speak',
      attributes: [{ name: 'foo', value: '' }],
      children: [],
    })
    expect(parseSSML('<speak foo="bar"></speak>')).toEqual({
      name: 'speak',
      attributes: [{ name: 'foo', value: 'bar' }],
      children: [],
    })
    expect(parseSSML('<speak baz:foo="bar"></speak>')).toEqual({
      name: 'speak',
      attributes: [{ name: 'baz:foo', value: 'bar' }],
      children: [],
    })
    expect(parseSSML('<speak foo  = "bar"></speak>')).toEqual({
      name: 'speak',
      attributes: [{ name: 'foo', value: 'bar' }],
      children: [],
    })
    expect(parseSSML('<speak foo  = "bar" hello="world"></speak>')).toEqual({
      name: 'speak',
      attributes: [
        { name: 'foo', value: 'bar' },
        { name: 'hello', value: 'world' },
      ],
      children: [],
    })
    expect(parseSSML('<speak><p foo="bar">Hello</p></speak>')).toEqual({
      name: 'speak',
      attributes: [],
      children: [
        {
          name: 'p',
          attributes: [{ name: 'foo', value: 'bar' }],
          children: ['Hello'],
        },
      ],
    })
  })

  it('should throw on invalid tag attributes', () => {
    expect(() => parseSSML("<speak foo='bar'></speak>")).toThrow()
    expect(() => parseSSML('<speak foo></speak>')).toThrow()
    expect(() => parseSSML('<speak foo="bar></speak>')).toThrow()
    expect(() => parseSSML('<speak foo=bar></speak>')).toThrow()
    expect(() => parseSSML('<speak foo=bar"></speak>')).toThrow()
    expect(() => parseSSML('<speak ="bar"></speak>')).toThrow()
  })

  /// Text
  it('should parse text', () => {
    expect(parseSSML('<speak>Hello world</speak>')).toEqual({
      name: 'speak',
      attributes: [],
      children: ['Hello world'],
    })
    expect(parseSSML('<speak>Hello<p> world</p> foo</speak>')).toEqual({
      name: 'speak',
      attributes: [],
      children: [
        'Hello',
        {
          name: 'p',
          attributes: [],
          children: [' world'],
        },
        ' foo',
      ],
    })
  })

  it('should unescape XML characters in text', () => {
    expect(parseSSML('<speak>TS &gt; JS</speak>')).toEqual({
      name: 'speak',
      attributes: [],
      children: ['TS > JS'],
    })
    expect(parseSSML('<speak>TS &amp;&gt; JS</speak>')).toEqual({
      name: 'speak',
      attributes: [],
      children: ['TS &> JS'],
    })
    expect(parseSSML('<speak>TS&lt; JS</speak>')).toEqual({
      name: 'speak',
      attributes: [],
      children: ['TS< JS'],
    })
    expect(parseSSML('<speak><p>TS&lt;</p> JS</speak>')).toEqual({
      name: 'speak',
      attributes: [],
      children: [
        {
          name: 'p',
          attributes: [],
          children: ['TS<'],
        },
        ' JS',
      ],
    })
  })
})

/// SSMLNodes -> Text
describe('ssmlNodeToText', () => {
  it('should convert SSML nodes to text', () => {
    expect('Hello world').toEqual('Hello world')
    expect(ssmlNodeToText({ name: 'baz', attributes: [], children: [] })).toEqual('')
    expect(
      ssmlNodeToText({ name: 'baz', attributes: [{ name: 'foo', value: 'bar' }], children: [] })
    ).toEqual('')
    expect(ssmlNodeToText({ name: 'baz', attributes: [], children: ['Hello world'] })).toEqual(
      'Hello world'
    )
    expect(
      ssmlNodeToText({
        name: 'baz',
        attributes: [{ name: 'foo', value: 'bar' }],
        children: ['Hello world'],
      })
    ).toEqual('Hello world')
    expect(
      ssmlNodeToText({
        name: 'baz',
        attributes: [{ name: 'foo', value: 'bar' }],
        children: [
          'baz',
          {
            name: 'p',
            attributes: [],
            children: ['Hello world'],
          },
          'baz',
        ],
      })
    ).toEqual('bazHello worldbaz')
  })
})
