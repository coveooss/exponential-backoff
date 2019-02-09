import { backOff } from "./backoff";
import { IBackOffOptions } from "./options";

describe("BackOff", () => {
  const mockSuccessResponse = { success: true };
  const mockFailResponse = { success: false };
  let backOffRequest: () => Promise<any>;
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

  function promiseThatFailsOnceThenSucceeds() {
    return (() => {
      let firstAttempt = true;

      const request = () => {
        if (firstAttempt) {
          firstAttempt = false;
          return Promise.reject(mockFailResponse);
        }

        return Promise.resolve(mockSuccessResponse);
      };

      return request;
    })();
  }

  beforeEach(() => {
    backOffOptions = { startingDelay: 0 };
    backOffRequest = jest.fn(promiseThatIsResolved());
  });

  describe("when request function is a promise that resolves", () => {
    it("returns the resolved value", () => {
      const request = initBackOff();
      return request.then(response =>
        expect(response).toBe(mockSuccessResponse)
      );
    });

    it("calls the request function only once", () => {
      const request = initBackOff();
      return request.then(() =>
        expect(backOffRequest).toHaveBeenCalledTimes(1)
      );
    });

    it(`when the #backOffOptions.numOfAttempts is 0,
    it overrides the value and calls the method only once`, () => {
      backOffOptions.numOfAttempts = 0;
      const request = initBackOff();

      return request.then(() =>
        expect(backOffRequest).toHaveBeenCalledTimes(1)
      );
    });
  });

  describe(`when the #backOffOptions.startingDelay is 100ms`, () => {
    const startingDelay = 100;

    beforeEach(() => (backOffOptions.startingDelay = startingDelay));

    it(`delays the first attempt`, () => {
      const startTime = Date.now();
      const request = initBackOff();

      return request.then(() => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        const roundedDuration = Math.round(duration / 100) * 100;

        expect(roundedDuration).toBe(startingDelay);
      });
    });

    it(`when #backOffOptions.delayFirstAttempt is 'false',
    it does not delay the first attempt`, () => {
      backOffOptions.delayFirstAttempt = false;
      const startTime = Date.now();
      const request = initBackOff();

      return request.then(() => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        const roundedDuration = Math.round(duration / 100) * 100;

        expect(roundedDuration).toBe(0);
      });
    });
  });

  describe("when request function is a promise that is rejected", () => {
    beforeEach(() => (backOffRequest = promiseThatIsRejected()));

    it("returns the rejected value", () => {
      const request = initBackOff();
      return request.catch(err => expect(err).toBe(mockFailResponse));
    });

    it("retries the request as many times as specified in #BackOffOptions.numOfAttempts", () => {
      backOffOptions.numOfAttempts = 2;
      backOffRequest = jest.fn(() => Promise.reject(mockFailResponse));

      const request = initBackOff();

      return request.catch(() => {
        expect(backOffRequest).toHaveBeenCalledTimes(
          backOffOptions.numOfAttempts as number
        );
      });
    });

    it(`when the #BackOffOptions.retry method is set to always return false,
    it only calls request function one time`, () => {
      backOffOptions.retry = () => false;
      backOffOptions.numOfAttempts = 2;
      backOffRequest = jest.fn(() => Promise.reject(mockFailResponse));

      const request = initBackOff();

      return request.catch(() =>
        expect(backOffRequest).toHaveBeenCalledTimes(1)
      );
    });
  });

  describe(`when calling #backOff with a function that throws an error the first time, and succeeds the second time`, () => {
    beforeEach(
      () => (backOffRequest = jest.fn(promiseThatFailsOnceThenSucceeds()))
    );

    it(`returns a successful response`, () => {
      const request = initBackOff();
      return request.then(response =>
        expect(response).toBe(mockSuccessResponse)
      );
    });

    it("calls the request function two times", () => {
      const request = initBackOff();
      return request.then(() =>
        expect(backOffRequest).toHaveBeenCalledTimes(2)
      );
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
        const roundedDuration =
          Math.round(duration / startingDelay) * startingDelay;

        expect(roundedDuration).toBe(totalExpectedDelay);
      });
    });
  });
});
