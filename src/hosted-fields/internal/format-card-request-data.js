/* eslint-disable camelcase */

'use strict';

function constructBillingAddress(data) {
  var billingAddress = {
    postal_code: data.postalCode,
    street_address: data.streetAddress,
    country: data.country
  };

  Object.keys(billingAddress).forEach(function (key) {
    if (billingAddress[key] == null) {
      delete billingAddress[key];
    }
  });

  return billingAddress;
}

module.exports = function (data) {
  var result = {};
  var billingAddress = constructBillingAddress(data);
  var hasBillingAddress = Object.keys(billingAddress).length > 0;

  if ('number' in data) {
    result.number = data.number;
  }

  if ('cvv' in data) {
    result.cvv = data.cvv;
  }

  if ('expirationMonth' in data) {
    result.expiration_month = data.expirationMonth;
  }

  if ('expirationYear' in data) {
    if (data.expirationYear.length === 2) {
      result.expiration_year = '20' + data.expirationYear;
    } else {
      result.expiration_year = data.expirationYear;
    }
  }

  if (hasBillingAddress) {
    result.billing_address = billingAddress;
  }

  if ('cardholderName' in data) {
    result.cardholderName = data.cardholderName;
  }

  return result;
};