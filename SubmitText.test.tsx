import React from "react";
import { act, cleanup, render, fireEvent } from "@testing-library/react";
import fc from "fast-check";
import SubmitText from "./SubmitText";
import {
  ReadValueCommand,
  ClickOnChildCommand,
  ChangeValueCommand,
  TestTools,
  TestData,
} from "./Commands";

const NUMBER_OF_COMMANDS = 100;

const INPUT_TEST_ID = "text-input";

function formCommands() {
  const tools: TestTools = {
    eventEmitter: fireEvent,
  };

  const data: TestData = {
    testId: INPUT_TEST_ID,
  };

  return fc.commands(
    [
      fc.nat(1).map((n) => new ClickOnChildCommand(tools, n)),
      fc.string().map((s) => new ChangeValueCommand(tools, data, s)),
      fc.constant(new ReadValueCommand(data)),
    ],
    NUMBER_OF_COMMANDS
  );
}

function newDomNode(randomString: string) {
  try {
    const container = document.createElement("div");
    container.id = randomString;
    return container;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

describe("<SubmitText />", function () {
  afterEach(cleanup);

  it("renders", function () {
    const testApi = render(<SubmitText />);
    expect(testApi).toBeDefined();
  });

  it("accepts any kind of string", function () {
    const testApi = render(<SubmitText />);
    fc.assert(
      fc.property(fc.string(), function (text) {
        fireEvent.change(testApi.getByTestId("text-input"), {
          target: { value: text },
        });
        expect(
          (testApi.getByTestId("text-input") as HTMLInputElement).value
        ).toBe(text);
      })
    );
  });

  it("preserves the value when clicking on it", function () {
    fc.assert(
      fc.asyncProperty(
        fc.scheduler({ act }),
        formCommands(),
        fc.string().map(newDomNode),
        fc.string(),
        async function (scheduler, wrappedCommands, domNode, initialValue) {
          const container = document.body.appendChild(domNode);
          const s = () => ({
            model: { value: initialValue },
            real: render(<SubmitText />, { container }),
          });
          await fc.scheduledModelRun(scheduler, s, wrappedCommands);
        }
      ),
      { verbose: true }
    );
  });
});
