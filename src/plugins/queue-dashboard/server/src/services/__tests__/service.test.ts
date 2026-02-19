
import { describe, it, expect } from 'vitest';
import serviceFactory from '../service';

describe('Queue Dashboard Service', () => {
  it('should return welcome message', () => {
    const service = serviceFactory({ strapi: {} as any });
    expect(service.getWelcomeMessage()).toBe('Welcome to Strapi 🚀');
  });
});
