import React from 'react';

function TextInput() {
  return <input data-testid="text-input" type="text" />;
}

function SubmitButton() {
  return <input data-testid="submit-button" type="button" />;
}

function SubmitText() {
  return (
    <form>
      <TextInput />
      <SubmitButton />
    </form>
  );
}

export default SubmitText;
