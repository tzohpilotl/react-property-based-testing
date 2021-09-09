import fc from "fast-check";
import { fireEvent, RenderResult } from "@testing-library/react";

interface Model {
  value: string;
}

interface TestTools {
  eventEmitter: typeof fireEvent;
}

interface TestData {
  testId: string;
}

class ClickOnChildCommand implements fc.AsyncCommand<Model, RenderResult> {
  constructor(readonly tools: TestTools, readonly n: number) {}

  check = () => true;

  async run(m: Model, q: RenderResult): Promise<void> {
    // This could be generalized to any side-effect
    const randomChild = q.container.children[this.n];
    this.tools.eventEmitter.click(randomChild);
  }

  toString() {
    return `click randomly`;
  }
}

class ChangeValueCommand implements fc.AsyncCommand<Model, RenderResult> {
  constructor(
    readonly tools: TestTools,
    readonly data: TestData,
    readonly text: string
  ) {}

  check = () => true;

  async run(m: Model, q: RenderResult): Promise<void> {
    const input = await q.findByTestId(this.data.testId);
    this.tools.eventEmitter.change(input, { target: { value: this.text } });
    m.value = this.text;
    await q.findByDisplayValue(this.text);
  }

  toString() {
    return `write ${this.text} to ${this.data.testId} input`;
  }
}

class ReadValueCommand implements fc.Command<Model, RenderResult> {
  constructor(readonly data: TestData) {}

  check = () => true;

  async run(m: Model, q: RenderResult): Promise<void> {
    const value = ((await q.findByTestId(this.data.testId)) as HTMLInputElement)
      .value;
    if (value !== m.value) {
      throw new Error(`Input: '${value}' !== Model: '${m.value}'`);
    }
  }

  toString = () => "read";
}

export {
  ClickOnChildCommand,
  ChangeValueCommand,
  ReadValueCommand,
  Model,
  TestTools,
  TestData,
};
