/**
 * Unit Tests for Tank Volume Calculations
 * Tests the calculateTankVolume function from bomEngine.js
 */

import { describe, test, expect } from '@jest/globals'
import { calculateTankVolume, calculatePanelQuantities, calculateHardwareQuantities } from '../lib/volumeCalculations.js'

describe('Tank Volume Calculations', () => {
  
  describe('calculateTankVolume', () => {
    
    test('should calculate volume correctly for standard dimensions', () => {
      const result = calculateTankVolume(5, 5, 3)
      
      expect(result.volumeML).toBe(75000000) // 5 * 5 * 3 * 1,000,000
      expect(result.volumeTier).toBe('>6ML')
      expect(result.volumeDisplay).toBe('75.00ML')
    })
    
    test('should calculate volume for small tank (under 6ML)', () => {
      const result = calculateTankVolume(1, 1, 1)
      
      expect(result.volumeML).toBe(1000000) // 1 * 1 * 1 * 1,000,000
      expect(result.volumeTier).toBe('<6ML')
      expect(result.volumeDisplay).toBe('1.00ML')
    })
    
    test('should handle edge case at 6ML threshold', () => {
      // Exactly 6ML should be '>6ML' tier (since condition is < 6000000)
      const result = calculateTankVolume(2, 1.5, 2)
      
      expect(result.volumeML).toBe(6000000) // 2 * 1.5 * 2 * 1,000,000
      expect(result.volumeTier).toBe('>6ML') // Equal to 6ML, so '>6ML'
      expect(result.volumeDisplay).toBe('6.00ML')
    })
    
    test('should handle decimal dimensions correctly', () => {
      const result = calculateTankVolume(2.5, 3.7, 1.8)
      
      expect(result.volumeML).toBeCloseTo(16650000, 0) // 2.5 * 3.7 * 1.8 * 1,000,000
      expect(result.volumeTier).toBe('>6ML')
      expect(result.volumeDisplay).toBe('16.65ML')
    })
    
    test('should handle very small dimensions', () => {
      const result = calculateTankVolume(0.1, 0.1, 0.1)
      
      expect(result.volumeML).toBeCloseTo(1000, 0) // 0.1 * 0.1 * 0.1 * 1,000,000
      expect(result.volumeTier).toBe('<6ML')
      expect(result.volumeDisplay).toBe('0.00ML')
    })
    
    test('should handle large dimensions', () => {
      const result = calculateTankVolume(25, 20, 15)
      
      expect(result.volumeML).toBe(7500000000) // 25 * 20 * 15 * 1,000,000
      expect(result.volumeTier).toBe('>6ML')
      expect(result.volumeDisplay).toBe('7500.00ML')
    })
    
    test('should round display volume to 2 decimal places', () => {
      const result = calculateTankVolume(1.333, 1.333, 1.333)
      
      expect(result.volumeML).toBeCloseTo(2368593.037, -3) // 1.333^3 * 1,000,000 (tolerance of 1000)
      expect(result.volumeDisplay).toBe('2.37ML') // Rounded to 2 decimal places
    })
    
    test('should handle zero dimensions gracefully', () => {
      const result = calculateTankVolume(0, 5, 3)
      
      expect(result.volumeML).toBe(0)
      expect(result.volumeTier).toBe('<6ML')
      expect(result.volumeDisplay).toBe('0.00ML')
    })
    
    test('should maintain precision for very precise calculations', () => {
      const result = calculateTankVolume(1.23456, 2.34567, 3.45678)
      
      const expectedVolume = 1.23456 * 2.34567 * 3.45678 * 1000000
      expect(result.volumeML).toBeCloseTo(expectedVolume, 5)
      expect(result.volumeTier).toBe('>6ML')
    })
  })

  describe('Volume Tier Classification', () => {
    
    test('should classify volumes under 6ML correctly', () => {
      const testCases = [
        [1, 1, 1], // 1ML
        [2, 1, 1], // 2ML
        [1.5, 2, 1.9] // 5.7ML
      ]
      
      testCases.forEach(([l, w, h]) => {
        const result = calculateTankVolume(l, w, h)
        expect(result.volumeTier).toBe('<6ML')
      })
    })
    
    test('should classify volumes over 6ML correctly', () => {
      const testCases = [
        [2, 2, 2], // 8ML
        [3, 3, 1], // 9ML
        [1.5, 2, 2.1] // 6.3ML
      ]
      
      testCases.forEach(([l, w, h]) => {
        const result = calculateTankVolume(l, w, h)
        expect(result.volumeTier).toBe('>6ML')
      })
    })
    
    test('should handle the exact 6ML boundary', () => {
      // Find dimensions that give exactly 6ML
      const result1 = calculateTankVolume(Math.cbrt(6), Math.cbrt(6), Math.cbrt(6))
      expect(result1.volumeTier).toBe('>6ML') // Math.cbrt(6)^3 = 6.000000000000001, so '>6ML'
      
      // Slightly under 6ML
      const result2 = calculateTankVolume(1.8, 1.8, 1.8)
      expect(result2.volumeTier).toBe('<6ML')
      
      // Slightly over 6ML
      const result3 = calculateTankVolume(2, 2, 1.51)
      expect(result3.volumeTier).toBe('>6ML')
    })
  })

  describe('Input Validation and Edge Cases', () => {
    
    test('should handle negative dimensions', () => {
      const result = calculateTankVolume(-1, 5, 3)
      
      expect(result.volumeML).toBe(-15000000)
      expect(result.volumeTier).toBe('<6ML')
      expect(result.volumeDisplay).toBe('-15.00ML')
    })
    
    test('should handle mixed positive and negative dimensions', () => {
      const result = calculateTankVolume(-2, -3, 4)
      
      expect(result.volumeML).toBe(24000000) // -2 * -3 * 4 = 24
      expect(result.volumeTier).toBe('>6ML')
      expect(result.volumeDisplay).toBe('24.00ML')
    })
    
    test('should handle very large numbers', () => {
      const result = calculateTankVolume(100, 100, 100)
      
      expect(result.volumeML).toBe(1000000000000) // 1 trillion ML
      expect(result.volumeTier).toBe('>6ML')
      expect(result.volumeDisplay).toBe('1000000.00ML')
    })
    
    test('should handle very small numbers', () => {
      const result = calculateTankVolume(0.001, 0.001, 0.001)
      
      expect(result.volumeML).toBe(0.001) // Very small volume
      expect(result.volumeTier).toBe('<6ML')
      expect(result.volumeDisplay).toBe('0.00ML')
    })
  })

  describe('Performance and Consistency', () => {
    
    test('should be deterministic for same inputs', () => {
      const dimensions = [3.14159, 2.71828, 1.41421]
      const result1 = calculateTankVolume(...dimensions)
      const result2 = calculateTankVolume(...dimensions)
      
      expect(result1).toEqual(result2)
    })
    
    test('should complete calculations quickly', () => {
      const start = Date.now()
      
      // Run 1000 calculations
      for (let i = 0; i < 1000; i++) {
        calculateTankVolume(Math.random() * 10, Math.random() * 10, Math.random() * 10)
      }
      
      const end = Date.now()
      const duration = end - start
      
      // Should complete 1000 calculations in under 100ms
      expect(duration).toBeLessThan(100)
    })
    
    test('should handle floating point precision correctly', () => {
      // Test with numbers that could cause floating point issues
      const result = calculateTankVolume(0.1 + 0.2, 0.3, 1.0) // 0.1 + 0.2 = 0.30000000000000004
      
      expect(result.volumeML).toBeCloseTo(90000, 0) // Close to 90,000 ML
      expect(result.volumeTier).toBe('<6ML')
    })
  })

  describe('Integration with Related Functions', () => {
    
    test('should work correctly with panel quantity calculations', () => {
      const length = 5, width = 4, height = 3
      const volume = calculateTankVolume(length, width, height)
      const panels = calculatePanelQuantities(length, width, height)
      
      expect(volume.volumeML).toBe(60000000)
      expect(panels.totalPanels).toBeGreaterThan(0)
    })
    
    test('should work correctly with hardware calculations', () => {
      const length = 6, width = 6, height = 4
      const volume = calculateTankVolume(length, width, height)
      const panels = calculatePanelQuantities(length, width, height)
      const hardware = calculateHardwareQuantities(panels)
      
      expect(volume.volumeML).toBe(144000000) // 144ML
      expect(volume.volumeTier).toBe('>6ML')
      expect(hardware.boltSets).toBeGreaterThan(0)
      expect(hardware.sealMeters).toBeGreaterThan(0)
    })
  })

  describe('Return Value Structure', () => {
    
    test('should return object with correct properties', () => {
      const result = calculateTankVolume(2, 3, 4)
      
      expect(result).toHaveProperty('volumeML')
      expect(result).toHaveProperty('volumeTier')
      expect(result).toHaveProperty('volumeDisplay')
      
      expect(typeof result.volumeML).toBe('number')
      expect(typeof result.volumeTier).toBe('string')
      expect(typeof result.volumeDisplay).toBe('string')
    })
    
    test('should have valid volumeTier values', () => {
      const validTiers = ['<6ML', '>6ML']
      
      // Test various dimensions
      const testCases = [
        [1, 1, 1], [2, 2, 2], [0.5, 0.5, 0.5], [10, 10, 10]
      ]
      
      testCases.forEach(([l, w, h]) => {
        const result = calculateTankVolume(l, w, h)
        expect(validTiers).toContain(result.volumeTier)
      })
    })
    
    test('should have properly formatted volumeDisplay', () => {
      const result = calculateTankVolume(3.14159, 2.71828, 1.73205)
      
      // Should end with 'ML' and have proper decimal formatting
      expect(result.volumeDisplay).toMatch(/^\d+\.\d{2}ML$/)
    })
  })
})