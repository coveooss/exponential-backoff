import { backOff, IBackOffRequest } from './backoff';
import { IBackOffOptions } from './options';

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

  function promiseThatFailsOnceThenSucceeds(){
    return (() => {
      let firstAttempt = true;
      
      const request = () => {
        if (firstAttempt) {
          firstAttempt = false;
          return Promise.reject(mockFailResponse);
        }
    
        return Promise.resolve(mockSuccessResponse);
      }
  
      return request;
    })()
  }

  beforeEach(() => {
    backOffOptions = { startingDelay: 0 };
    backOffRequest = { fn: jest.fn(promiseThatIsResolved()) };
  });

  describe('when #backOffRequest.fn is a promise that resolves', () => {
    it('returns the resolved value', () => {
      const request = initBackOff();
      return request.then(response => expect(response).toBe(mockSuccessResponse));
    });

    it('calls the #backOffRequest.fn only once', () => {
      const request = initBackOff();
      return request.then(() => expect(backOffRequest.fn).toHaveBeenCalledTimes(1));
    });

    it(`when the #backOffOptions.numOfAttempts is 0,
    it overrides the value and calls the method only once`, () => {
      backOffOptions.numOfAttempts = 0;
      const request = initBackOff();

      return request.then(() => expect(backOffRequest.fn).toHaveBeenCalledTimes(1));
    });
  });
  
  describe(`when the #backOffOptions.startingDelay is 100ms`, () => {
    const startingDelay = 100;

    beforeEach(() => backOffOptions.startingDelay = startingDelay);

    it(`delays the first attempt`, () => {
      const startTime = Date.now();
      const request = initBackOff();
      
      return request.then(() => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        const roundedDuration = Math.round(duration/100) * 100;

        expect(roundedDuration).toBe(startingDelay);
      })
    })

    it(`when #backOffOptions.delayFirstAttempt is 'false',
    it does not delay the first attempt`, () => {
      backOffOptions.delayFirstAttempt = false;
      const startTime = Date.now();
      const request = initBackOff();
      
      return request.then(() => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        const roundedDuration = Math.round(duration/100) * 100;

        expect(roundedDuration).toBe(0);
      })
    })
  })
  
  describe('when #BackOffRequest.fn is a promise that is rejected', () => {
    beforeEach(() => backOffRequest.fn = promiseThatIsRejected());

    it('returns the rejected value', () => {
      const request = initBackOff();
      return request.catch(err => expect(err).toBe(mockFailResponse));
    });

    it('retries the request as many times as specified in #BackOffOptions.numOfAttempts', () => {
      backOffOptions.numOfAttempts = 2;
      backOffRequest.fn = jest.fn(() => Promise.reject(mockFailResponse));
      
      const request = initBackOff();

      return request.catch(() => {
        expect(backOffRequest.fn).toHaveBeenCalledTimes(backOffOptions.numOfAttempts as number);
      });
    });

    it(`when the #BackOffRequest.retry method is set to always return false,
    it only calls #BackOffRequest.fn one time`, () => {
      backOffRequest.retry = () => false;
      backOffOptions.numOfAttempts = 2;
      backOffRequest.fn = jest.fn(() => Promise.reject(mockFailResponse));

      const request = initBackOff();

      return request.catch(() => expect(backOffRequest.fn).toHaveBeenCalledTimes(1));
    });
  });

  describe(`when calling #backOff with a function that throws an error the first time, and succeeds the second time`, () => {
    beforeEach(() => backOffRequest.fn = jest.fn(promiseThatFailsOnceThenSucceeds()));

    it(`returns a successful response`, () => {
      const request = initBackOff();
      return request.then(response => expect(response).toBe(mockSuccessResponse));
    });

    it('calls the #BackOffRequest.fn method two times', () => {
      const request = initBackOff();
      return request.then(() => expect(backOffRequest.fn).toHaveBeenCalledTimes(2));
    });

    it(`when setting the #BackOffOption.timeMultiple to a value,
    it applies a delay between the first and the second call`, () => {
      const startingDelay = 100;
      const timeMultiple = 3;
      const totalExpectedDelay = startingDelay + timeMultiple * startingDelay;

      backOffOptions.startingDelay = startingDelay;
      backOffOptions.timeMultiple = timeMultiple;

      const startTime = Date.now();
      const request = initBackOff();

      return request.then(() => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        const roundedDuration = Math.round(duration / startingDelay) * startingDelay;

        expect(roundedDuration).toBe(totalExpectedDelay);
      });
    });
  });
});
