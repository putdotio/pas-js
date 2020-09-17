import createClient from '.'

describe('Initialized client', () => {
  it('does not explode', () => {
    expect(createClient()).toBeTruthy()
  })
})
