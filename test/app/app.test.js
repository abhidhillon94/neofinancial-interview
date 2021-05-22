const app = require('../../app/app')

describe('App Test', () => {
    test('App Environment', () => {
        expect(app.settings.env).toEqual('test')
    })
      
    test('App Base Path', () => {
        expect(app.mountpath).toEqual('/')
    })
})
