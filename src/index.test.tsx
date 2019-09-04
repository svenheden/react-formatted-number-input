import * as React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import { createFormattedNumberInput } from './';

const FancyInput: React.FC<any> = React.forwardRef((props, ref) => {
    return <div><input ref={ref} {...props} /></div>;
});

const FormattedNumberInput = createFormattedNumberInput<any>(FancyInput, { allowNegativeValues: true });

class Container extends React.Component {
    state = {
        value: undefined
    };

    handleChange = (value?: number) => {
        this.setState({ value });
    }

    render() {
        return <FormattedNumberInput value={this.state.value} onChange={this.handleChange} />;
    }
}

const setup = () => {
    const utils = render(<Container />);
    const input = utils.container.querySelector('input')!;

    return {
        input,
        ...utils,
    }
}

afterEach(cleanup);

test('It should not format amounts under 1000', () => {
    const { input } = setup();
    fireEvent.change(input, { target: { value: '645' }});
    expect(input.value).toBe('645');
});

test('It should thousand separate amounts above 1000', () => {
    const { input } = setup();
    fireEvent.change(input, { target: { value: '13456789' }});
    expect(input.value).toBe('13 456 789');
});

test('It should not allow letters to be inputted', () => {
    const { input } = setup();
    expect(input.value).toBe('');
    fireEvent.change(input, { target: { value: 'foobar' }})
    expect(input.value).toBe('');
});

test('It should allow a minus character to be inputted', () => {
    const { input } = setup();
    fireEvent.change(input, { target: { value: '-' }});
    expect(input.value).toBe('-');
});

test('It should allow negative values', () => {
    const { input } = setup();
    fireEvent.change(input, { target: { value: '-45' }});
    expect(input.value).toBe('-45');
});

test('It should allow a decimal separator to be inputted', () => {
    const { input } = setup();
    fireEvent.change(input, { target: { value: '45' }});
    fireEvent.change(input, { target: { value: '45,' }});
    expect(input.value).toBe('45,');
});

test('It should allow a decimal separator followed by a 0 to be inputted', () => {
    const { input } = setup();
    fireEvent.change(input, { target: { value: '45' }});
    fireEvent.change(input, { target: { value: '45,0' }});
    expect(input.value).toBe('45,0');
});
