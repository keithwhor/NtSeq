function Test() {

  this.count = 0;
  this.passed = 0;
  this.tests = [];

};

Test.prototype.add = function(fn, assertion) {

  this.tests.push([fn, assertion]);
  this.count++;

};

Test.prototype.run = function() {

  var tests = this.tests;
  var i, len, result, pct;

  for (i = 0, len = tests.length; i < len; i++) {

    result = tests[i][0]();

    if (result) {

      console.log('Test passed: ' + tests[i][1]);
      this.passed++;

    } else {

      console.warn('Test failed: ' + tests[i][1]);

    }

  }

  pct = ((this.passed / this.count) * 100).toFixed(2);

  console.log('Passed ' + this.passed + ' of ' + this.count + ' tests. (' + pct + '%)');

  if (this.passed < this.count) {

    console.warn('There seem to be some errors with the package');

  }

};

module.exports = new Test();
