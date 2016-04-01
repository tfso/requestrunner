var expect = require('expect.js');
var path = require('path');
var RR = require('../');
describe('request runner', () => {

    describe('from file config', () => {
        var runner;

        beforeEach(() => {
            runner = RR(path.join(__dirname, 'actions.test.json'));
        });

        it('should load actions and default', () => {
            expect(runner.actions).to.be.an(Array);
        });
        it('should run all the request without errors', (done) => {
            runner.run({}, (err, result) => {
                expect(result).to.have.property('failedActionsCount', 0);
                done();
            })
        });

    });

    describe('from manual config', () => {
        var runner;
        beforeEach(()=> {
            runner = RR({url: 'https://api.github.com'}, {
                accepts: 'application/json',
                'user-agent': 'node/requestrunner'
            })
        });

        it('should have a single action', () => {
            expect(runner.actions).to.have.length(1);
        })
    });

    describe('no inital config', () => {
        var runner;
        before(() => {
            runner = RR()
        });

        it('should be possible add actions', () => {
            runner.add(
                [{url: 'https://api.github.com'}, {url: 'https://api.github.com'}],
                {
                    accepts: 'application/json',
                    'user-agent': 'node/requestrunner'
                });
        });

        it('should hold actions two actions', () => {
            expect(runner.actions).to.have.length(2);
        });
    });
});
