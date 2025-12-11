import { describe, test, expect } from '@jest/globals';
import { generateOTP } from '../../src/app/api/utils/otp.utils.js';

describe('OTP Utils - generateOTP', () => {
  describe('Default Behavior', () => {
    test('should generate 4-digit OTP by default', () => {
      const otp = generateOTP();
      
      expect(otp).toBeDefined();
      expect(typeof otp).toBe('string');
      expect(otp.length).toBe(4);
    });

    test('should generate OTP with only numeric characters', () => {
      const otp = generateOTP();
      
      expect(/^\d+$/.test(otp)).toBe(true);
    });

    test('should generate different OTPs on multiple calls', () => {
      const otp1 = generateOTP();
      const otp2 = generateOTP();
      const otp3 = generateOTP();
      
      // At least one should be different (statistically almost certain)
      const allSame = otp1 === otp2 && otp2 === otp3;
      expect(allSame).toBe(false);
    });
  });

  describe('Custom Length', () => {
    test('should generate 6-digit OTP', () => {
      const otp = generateOTP(6);
      
      expect(otp.length).toBe(6);
      expect(/^\d+$/.test(otp)).toBe(true);
    });

    test('should generate 8-digit OTP', () => {
      const otp = generateOTP(8);
      
      expect(otp.length).toBe(8);
      expect(/^\d+$/.test(otp)).toBe(true);
    });

    test('should generate 1-digit OTP', () => {
      const otp = generateOTP(1);
      
      expect(otp.length).toBe(1);
      expect(/^\d+$/.test(otp)).toBe(true);
    });

    test('should generate 10-digit OTP', () => {
      const otp = generateOTP(10);
      
      expect(otp.length).toBe(10);
      expect(/^\d+$/.test(otp)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    test('should generate empty string for length 0', () => {
      const otp = generateOTP(0);
      
      expect(otp).toBe('');
      expect(otp.length).toBe(0);
    });

    test('should handle negative length as 0', () => {
      const otp = generateOTP(-5);
      
      expect(otp).toBe('');
    });

    test('should generate very long OTP', () => {
      const otp = generateOTP(100);
      
      expect(otp.length).toBe(100);
      expect(/^\d+$/.test(otp)).toBe(true);
    });
  });

  describe('OTP Range Validation', () => {
    test('should generate OTP with digits 0-9 only', () => {
      // Generate multiple OTPs to test randomness
      const otps = Array.from({ length: 20 }, () => generateOTP(10));
      
      otps.forEach(otp => {
        const digits = otp.split('');
        digits.forEach(digit => {
          const num = parseInt(digit, 10);
          expect(num).toBeGreaterThanOrEqual(0);
          expect(num).toBeLessThanOrEqual(9);
        });
      });
    });

    test('should generate OTP that can be parsed as number', () => {
      const otp = generateOTP();
      const parsed = parseInt(otp, 10);
      
      expect(isNaN(parsed)).toBe(false);
      expect(parsed).toBeGreaterThanOrEqual(0);
      expect(parsed).toBeLessThan(10000);
    });
  });

  describe('Randomness', () => {
    test('should generate diverse OTPs over many iterations', () => {
      const otps = new Set();
      const iterations = 100;
      
      for (let i = 0; i < iterations; i++) {
        otps.add(generateOTP(4));
      }
      
      // Should generate at least 50 unique OTPs out of 100
      // (10,000 possible 4-digit combinations, so collision is unlikely)
      expect(otps.size).toBeGreaterThan(50);
    });

    test('should generate all possible single digits eventually', () => {
      const digits = new Set();
      
      // Generate enough 1-digit OTPs to likely see all digits
      for (let i = 0; i < 50; i++) {
        digits.add(generateOTP(1));
      }
      
      // Should see at least 8 different digits
      expect(digits.size).toBeGreaterThanOrEqual(8);
    });
  });

  describe('Return Type Consistency', () => {
    test('should always return a string', () => {
      expect(typeof generateOTP()).toBe('string');
      expect(typeof generateOTP(1)).toBe('string');
      expect(typeof generateOTP(6)).toBe('string');
      expect(typeof generateOTP(10)).toBe('string');
    });

    test('should not return undefined or null', () => {
      expect(generateOTP()).not.toBeUndefined();
      expect(generateOTP()).not.toBeNull();
      expect(generateOTP(0)).not.toBeUndefined();
      expect(generateOTP(0)).not.toBeNull();
    });
  });
});
