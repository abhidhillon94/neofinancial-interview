const router = require('../../../app/routes')


describe('controllers test', () => {
    test('Router Setup', () => {

        const routes = router.stack
            .filter(layer => layer.route)
            .map(layer => layer.route.path)

        expect(routes.includes('/')).toBe(true)
        expect(routes.includes('/lotteryStatus')).toBe(true)
    })
});
