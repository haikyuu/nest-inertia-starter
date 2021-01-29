export default class {
  state: {
    count: number;
  };
  onCreate() {
    this.state = {
      count: 0,
    };
  }
  increment() {
    this.state.count++;
  }
}
