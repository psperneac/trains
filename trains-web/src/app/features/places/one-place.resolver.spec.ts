import { TestBed } from '@angular/core/testing';

import { OnePlaceResolver } from './one-place.resolver';

describe('OnePlaceResolverResolver', () => {
  let resolver: OnePlaceResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(OnePlaceResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
