import { AbstractMapper } from './abstract.mapper';

/**
 * Concrete implementation of AbstractMapper for testing purposes.
 */
class ConcreteMapper extends AbstractMapper<{ id: string; name: string }, { id: string; name: string }> {
  toDto(domain: { id: string; name: string }): { id: string; name: string } {
    return { ...domain };
  }

  toDomain(dto: { id: string; name: string }, domain?: { id: string; name: string }): { id: string; name: string } {
    if (!domain) {
      return { ...dto };
    }
    return { ...domain, ...dto };
  }
}

describe('AbstractMapper', () => {
  let mapper: ConcreteMapper;

  beforeEach(() => {
    mapper = new ConcreteMapper();
  });

  describe('toDto', () => {
    it('should return domain object as-is in concrete implementation', () => {
      const domain = { id: '123', name: 'Test' };

      const result = mapper.toDto(domain);

      expect(result).toEqual(domain);
      expect(result).not.toBe(domain); // Should be a copy
    });

    it('should return object with correct properties', () => {
      const domain = { id: '456', name: 'MyName' };

      const result = mapper.toDto(domain);

      expect(result.id).toBe('456');
      expect(result.name).toBe('MyName');
    });
  });

  describe('toDomain', () => {
    it('should return dto as-is when domain is not provided', () => {
      const dto = { id: '789', name: 'DtoName' };

      const result = mapper.toDomain(dto);

      expect(result).toEqual(dto);
      expect(result).not.toBe(dto); // Should be a copy
    });

    it('should merge dto onto existing domain', () => {
      const existingDomain = { id: 'original-id', name: 'OriginalName' };
      const dto = { id: 'new-id', name: 'NewName' };

      const result = mapper.toDomain(dto, existingDomain);

      expect(result.id).toBe('new-id'); // dto value overwrites
      expect(result.name).toBe('NewName'); // dto value overwrites
    });

    it('should not mutate original domain when merging', () => {
      const existingDomain = { id: 'original-id', name: 'OriginalName' };
      const dto = { id: 'original-id', name: 'NewName' };

      mapper.toDomain(dto, existingDomain);

      expect(existingDomain.name).toBe('OriginalName'); // Original unchanged
    });
  });

  describe('abstract class behavior', () => {
    it('should be abstract and require concrete implementation', () => {
      // AbstractMapper is abstract - verify the class exists
      // TypeScript enforces implementation at compile time
      expect(AbstractMapper).toBeDefined();
    });

    it('should enforce method signatures in implementing classes', () => {
      // ConcreteMapper properly implements both abstract methods
      const instance = new ConcreteMapper();
      expect(typeof instance.toDto).toBe('function');
      expect(typeof instance.toDomain).toBe('function');
    });

    it('concrete implementation should have correct method signatures', () => {
      const instance = new ConcreteMapper();
      const domain = { id: '1', name: 'test' };
      const dto = { id: '1', name: 'test' };

      // Both methods should work and return expected types
      const dtoResult = instance.toDto(domain);
      const domainResult = instance.toDomain(dto);

      expect(dtoResult).toEqual(domain);
      expect(domainResult).toEqual(dto);
    });
  });
});
