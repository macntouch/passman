exports.config = {
	seleniumAddress: 'http://localhost:4444/wd/hub',
	specs: ['tests/js/create_vault.js'],
	capabilities: {
		'browserName': 'firefox', // or 'safari'
		'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
		'build': process.env.TRAVIS_BUILD_NUMBER
	},
	jasmineNodeOpts: {
		print: function () {}
	},
	onPrepare: function () {
		var SpecReporter = require('jasmine-spec-reporter');
		// add jasmine spec reporter
		jasmine.getEnv().addReporter(new SpecReporter({displayStacktrace: 'all'}));
	}
};
