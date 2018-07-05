import { backOff, IBackOffRequest, IBackOffOptions } from './backoff';

export function BackOffTest() {
  describe('BackOff', () => {
    const mockSuccessResponse = { success: true };
    const mockFailResponse = { success: false };
    let backOffRequest: IBackOffRequest<{}>;
    let backOffOptions: Partial<IBackOffOptions>;

    function initBackOff() {
      return backOff(backOffRequest, backOffOptions);
    }

    function promiseThatIsResolved() {
      return () => Promise.resolve(mockSuccessResponse);
    }

    function promiseThatIsRejected() {
      return () => Promise.reject(mockFailResponse);
    }

    beforeEach(() => {
      backOffOptions = { startingDelay: 0 };
      backOffRequest = { fn: promiseThatIsResolved() };
    });

    describe('when #backOffRequest.fn is a promise that resolves', () => {
      it('returns the resolved value', done => {
        const request = initBackOff();

        request.then(response => {
          expect(response).toBe(mockSuccessResponse);
          done();
        });
      });

      it('calls the #backOffRequest.fn only once', done => {
        spyOn(backOffRequest, 'fn');
        const request = initBackOff();

        request.then(() => {
          expect(backOffRequest.fn).toHaveBeenCalledTimes(1);
          done();
        });
      });

      it(`when the #backOffOptions.numOfAttempts is 0,
      it overrides the value and calls the method only once`, done => {
        backOffOptions.numOfAttempts = 0;
        spyOn(backOffRequest, 'fn');

        const request = initBackOff();

        request.then(() => {
          expect(backOffRequest.fn).toHaveBeenCalledTimes(1);
          done();
        });
      });
    });

    describe('when #BackOffRequest.fn is a promise that is rejected', () => {
      beforeEach(() => (backOffRequest.fn = promiseThatIsRejected()));

      it('returns the rejected value', done => {
        const request = initBackOff();
        request.catch(err => {
          expect(err).toBe(mockFailResponse);
          done();
        });
      });

      it('retries the request as many times as specified in #BackOffOptions.numOfAttempts', done => {
        backOffOptions.numOfAttempts = 2;
        spyOn(backOffRequest, 'fn').and.returnValue(Promise.reject(mockFailResponse));

        const request = initBackOff();

        request.catch(() => {
          expect(backOffRequest.fn).toHaveBeenCalledTimes(backOffOptions.numOfAttempts as number);
          done();
        });
      });

      it(`when the #BackOffRequest.retry method is set to always return false,
      it only calls #BackOffRequest.fn one time`, done => {
        backOffRequest.retry = () => false;
        backOffOptions.numOfAttempts = 2;
        spyOn(backOffRequest, 'fn').and.returnValue(Promise.reject(mockFailResponse));

        const request = initBackOff();

        request.catch(() => {
          expect(backOffRequest.fn).toHaveBeenCalledTimes(1);
          done();
        });
      });
    });

    describe(`when calling #backOff with a function that throws an error the first time, and succeeds the second time`, () => {
      beforeEach(() => {
        spyOn(backOffRequest, 'fn').and.returnValues(Promise.reject(mockFailResponse), Promise.resolve(mockSuccessResponse));
      });

      it(`returns a successful response`, done => {
        const request = initBackOff();

        request.then(response => {
          expect(response).toBe(mockSuccessResponse);
          done();
        });
      });

      it('calls the #BackOffRequest.fn method two times', done => {
        const request = initBackOff();

        request.then(() => {
          expect(backOffRequest.fn).toHaveBeenCalledTimes(2);
          done();
        });
      });

      it(`when setting the #BackOffOption.timeMultiple to a value,
      it applies a delay between the first and the second call`, done => {
        const startingDelay = 100;
        const timeMultiple = 3;
        const totalExpectedDelay = startingDelay + timeMultiple * startingDelay;

        backOffOptions.startingDelay = startingDelay;
        backOffOptions.timeMultiple = timeMultiple;

        const startTime = Date.now();
        const request = initBackOff();

        request.then(() => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          const roundedDuration = Math.round(duration / startingDelay) * startingDelay;

          expect(roundedDuration).toBe(totalExpectedDelay);
          done();
        });
      });
    });
  });
}
