import { expect } from 'chai';
import 'mocha';

import { Timer } from '../../src/models';

describe('Timer', () => {

  describe('constructor', () => {

    it('should initialise timer as started on construction', () => {

      const t = new Timer();

      const now = Date.now();
      const allowedDelta = 100;
      expect(t.startDate.getTime()).to.be.closeTo(now, allowedDelta);

      // eslint-disable-next-line no-magic-numbers
      expect(t.endDate.getTime()).to.be.equal(new Date(-1).getTime());

      // eslint-disable-next-line no-magic-numbers
      const expectedDuration = -1 - t.startDate.getTime();
      expect(t.duration).to.be.equal(expectedDuration);

    });
  });

  describe('start', () => {

    it('should start the timer on first call', () => {

      const t = new Timer();
      t.start();

      const now = Date.now();
      const allowedDelta = 100;
      expect(t.startDate.getTime()).to.be.closeTo(now, allowedDelta);

      // eslint-disable-next-line no-magic-numbers
      expect(t.endDate.getTime()).to.be.equal(new Date(-1).getTime());

      // eslint-disable-next-line no-magic-numbers
      const expectedDuration = -1 - t.startDate.getTime();
      expect(t.duration).to.be.equal(expectedDuration);

    });

    it('should restart the timer after stop is called', () => {

      const t = new Timer();
      t.start();
      t.stop();

      const now = Date.now();
      const allowedDelta = 100;
      expect(t.startDate.getTime()).to.be.closeTo(now, allowedDelta);
      expect(t.endDate.getTime()).to.be.closeTo(now, allowedDelta);
      expect(t.duration).to.be.closeTo(0, allowedDelta);

      t.start();
      // eslint-disable-next-line no-magic-numbers
      expect(t.endDate.getTime()).to.be.equal(new Date(-1).getTime());

    });
  });

  describe('stop', () => {

    it('should stop the timer', () => {

      const t = new Timer();
      t.start();
      t.stop();

      const now = Date.now();
      const allowedDelta = 100;
      expect(t.startDate.getTime()).to.be.closeTo(now, allowedDelta);
      expect(t.endDate.getTime()).to.be.closeTo(now, allowedDelta);
      expect(t.duration).to.be.closeTo(0, allowedDelta);

    });

    it('should calculate a duration between start and stop times', (doneFn: Mocha.Done) => {

      const t = new Timer();
      t.start();
      const startDate = Date.now();

      const delay = 500;
      const allowedDelta = 100;

      setTimeout(() => {
        t.stop();
        const endDate = Date.now();

        expect(t.startDate.getTime()).to.be.closeTo(startDate, allowedDelta);
        expect(t.endDate.getTime()).to.be.closeTo(endDate, allowedDelta);
        expect(t.duration).to.be.closeTo(delay, allowedDelta);

        doneFn();
      }, delay);

    });
  });
});
