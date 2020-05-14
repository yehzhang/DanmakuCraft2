async function poll<T>(f: () => Promise<T | null> | T | null): Promise<T> {
  return new Promise((resolve) => {
    async function check() {
      const result = await f();
      if (result !== null) {
        resolve(result);
        return;
      }

      setTimeout(check, 100);
    }

    check();
  });
}

export default poll;
