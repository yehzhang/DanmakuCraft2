class ConditionalVariable {
  constructor(
      private currentPromise: Promise<void> | null = null,
      public notify: () => void = () => {
      }) {
  }

  async wait() {
    if (this.currentPromise == null) {
      this.currentPromise = new Promise(resolve => {
        this.notify = resolve;
      })
          .then(resolve => {
            this.currentPromise = null;
          });
    }
    return this.currentPromise;
  }
}

export default ConditionalVariable;
