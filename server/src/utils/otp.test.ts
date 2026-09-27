import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isValidEmail, isValidIndianMobile, normalizeMobile } from './otp.js';

describe('email validation', () => {
  it('accepts valid emails', () => {
    assert.equal(isValidEmail('you@example.com'), true);
  });
  it('rejects invalid emails', () => {
    assert.equal(isValidEmail('not-an-email'), false);
    assert.equal(isValidEmail(''), false);
  });
});

describe('indian mobile validation', () => {
  it('accepts 10-digit numbers starting 6-9', () => {
    assert.equal(isValidIndianMobile('9876543210'), true);
    assert.equal(isValidIndianMobile('+91 98765 43210'), true);
  });
  it('rejects bad numbers', () => {
    assert.equal(isValidIndianMobile('12345'), false);
    assert.equal(isValidIndianMobile('5876543210'), false);
    assert.equal(isValidIndianMobile(''), false);
  });
  it('normalizes +91 prefix', () => {
    assert.equal(normalizeMobile('+91 98765 43210'), '9876543210');
  });
});
