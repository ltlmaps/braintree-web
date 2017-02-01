'use strict';

var create = require('../../../src/paypal-checkout').create;
var PayPalCheckout = require('../../../src/paypal-checkout/paypal-checkout');
var Promise = require('../../../src/lib/promise');
var fake = require('../../helpers/fake');
var browserDetection = require('../../../src/lib/browser-detection');
var BraintreeError = require('../../../src/lib/braintree-error');
var version = require('../../../package.json').version;

function rejectIfResolves() {
  throw new Error('should not resolve');
}

describe('paypalCheckout.create', function () {
  beforeEach(function () {
    var configuration = fake.configuration();

    configuration.gatewayConfiguration.paypalEnabled = true;
    configuration.gatewayConfiguration.paypal = {};

    this.configuration = configuration;
    this.client = {
      getConfiguration: function () {
        return configuration;
      }
    };
  });

  context('with promises', function () {
    it('returns a promise', function () {
      var promise = create({client: this.client});

      expect(promise).to.be.an.instanceof(Promise);
    });

    it('errors out if no client given', function (done) {
      create({}).then(rejectIfResolves).catch(function (err) {
        expect(err).to.be.an.instanceof(BraintreeError);
        expect(err.type).to.equal('MERCHANT');
        expect(err.code).to.equal('INSTANTIATION_OPTION_REQUIRED');
        expect(err.message).to.equal('options.client is required when instantiating PayPal Checkout.');
        done();
      });
    });

    it('errors out if client version does not match', function (done) {
      this.configuration.analyticsMetadata.sdkVersion = '1.2.3';

      create({client: this.client}).then(rejectIfResolves).catch(function (err) {
        expect(err).to.be.an.instanceof(BraintreeError);
        expect(err.type).to.equal('MERCHANT');
        expect(err.code).to.equal('INCOMPATIBLE_VERSIONS');
        expect(err.message).to.equal('Client (version 1.2.3) and PayPal Checkout (version ' + version + ') components must be from the same SDK version.');
        done();
      });
    });

    it('errors out if paypal is not enabled for the merchant', function (done) {
      this.configuration.gatewayConfiguration.paypalEnabled = false;

      create({client: this.client}).then(rejectIfResolves).catch(function (err) {
        expect(err).to.be.an.instanceof(BraintreeError);
        expect(err.type).to.equal('MERCHANT');
        expect(err.code).to.equal('PAYPAL_NOT_ENABLED');
        expect(err.message).to.equal('PayPal is not enabled for this merchant.');
        done();
      });
    });

    it('errors out if browser does not support popups', function (done) {
      this.sandbox.stub(browserDetection, 'supportsPopups').returns(false);

      create({client: this.client}).then(rejectIfResolves).catch(function (err) {
        expect(err).to.be.an.instanceof(BraintreeError);
        expect(err.type).to.equal('CUSTOMER');
        expect(err.code).to.equal('PAYPAL_BROWSER_NOT_SUPPORTED');
        expect(err.message).to.equal('Browser is not supported.');
        done();
      });
    });

    it('resolves with paypalCheckoutInstance', function () {
      return create({client: this.client}).then(function (instance) {
        expect(instance).to.be.an.instanceof(PayPalCheckout);
      });
    });
  });

  context('with callbacks', function () {
    it('does not return a promise', function () {
      var result = create({client: this.client}, function () {});

      expect(result).to.not.be.an.instanceof(Promise);
    });

    it('errors out if no client given', function (done) {
      create({}, function (err, thingy) {
        expect(err).to.be.an.instanceof(BraintreeError);
        expect(err.type).to.equal('MERCHANT');
        expect(err.code).to.equal('INSTANTIATION_OPTION_REQUIRED');
        expect(err.message).to.equal('options.client is required when instantiating PayPal Checkout.');
        expect(thingy).not.to.exist;
        done();
      });
    });

    it('errors out if client version does not match', function (done) {
      this.configuration.analyticsMetadata.sdkVersion = '1.2.3';

      create({client: this.client}, function (err, thingy) {
        expect(err).to.be.an.instanceof(BraintreeError);
        expect(err.type).to.equal('MERCHANT');
        expect(err.code).to.equal('INCOMPATIBLE_VERSIONS');
        expect(err.message).to.equal('Client (version 1.2.3) and PayPal Checkout (version ' + version + ') components must be from the same SDK version.');
        expect(thingy).not.to.exist;
        done();
      });
    });

    it('errors out if paypal is not enabled for the merchant', function (done) {
      this.configuration.gatewayConfiguration.paypalEnabled = false;

      create({client: this.client}, function (err, thingy) {
        expect(err).to.be.an.instanceof(BraintreeError);
        expect(err.type).to.equal('MERCHANT');
        expect(err.code).to.equal('PAYPAL_NOT_ENABLED');
        expect(err.message).to.equal('PayPal is not enabled for this merchant.');
        expect(thingy).not.to.exist;
        done();
      });
    });

    it('errors out if browser does not support popups', function (done) {
      this.sandbox.stub(browserDetection, 'supportsPopups').returns(false);

      create({client: this.client}, function (err, thingy) {
        expect(err).to.be.an.instanceof(BraintreeError);
        expect(err.type).to.equal('CUSTOMER');
        expect(err.code).to.equal('PAYPAL_BROWSER_NOT_SUPPORTED');
        expect(err.message).to.equal('Browser is not supported.');
        expect(thingy).not.to.exist;
        done();
      });
    });
  });
});
