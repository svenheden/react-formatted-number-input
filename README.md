# React formatted number input

A higher order component for formatting values in input elements as numbers


[![Build Status][travis-image]][travis-url]
[![NPM version][npm-image]][npm-url]


## Install

```
$ npm install --save react-formatted-number-input
```


## Usage

```ts
import React from 'react';
import { createFormattedNumberInput } from 'react-formatted-number-input';

class YourInputComponent extends React.Component {
  render() {
    const { innerRef, ...rest } = this.props;

    return <input ref={innerRef} {...rest} />
  }
}

const FormattedNumberInput = createFormattedNumberInput(YourInputComponent, { precision: 2 });

class Demo extends React.Component {
  state = {};

  handleChange = (value) => {
    this.setState({ value });
  }

  render() {
    return (
      <FormattedNumberInput
        value={this.state.value}
        onChange={this.handleChange}
      />
    );
  }
}

export default Demo;
```


## License

MIT © [Jonathan Persson](https://github.com/jonathanp)

[npm-url]: https://npmjs.org/package/react-formatted-number-input
[npm-image]: https://badge.fury.io/js/react-formatted-number-input.svg
[travis-image]: https://travis-ci.org/jonathanp/react-formatted-number-input.svg
[travis-url]: https://travis-ci.org/jonathanp/react-formatted-number-input