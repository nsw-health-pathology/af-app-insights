import { expect } from 'chai';
import { } from 'mocha';

import { AppInsightsFactory } from '../../src/services';

describe('AppInsightsFactory', () => {

  beforeEach(() => {
    // Force singleton to be undefined for tests

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    (AppInsightsFactory as any).client = undefined;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    expect((AppInsightsFactory as any).client).to.be.equal(undefined);

  });

  describe('create', () => {

    it('should return singleton instance', () => {

      const client1 = new AppInsightsFactory().create();
      const client2 = new AppInsightsFactory().create();

      // Strict reference equality
      expect(client1).to.be.equal(client2);

    });
  });

  describe('defaultClient', () => {

    it('should return singleton instance', () => {

      const client1 = new AppInsightsFactory().defaultClient();
      const client2 = new AppInsightsFactory().defaultClient();

      // Strict reference equality
      expect(client1).to.be.equal(client2);

    });
  });
});
