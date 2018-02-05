import * as React from 'react';

export interface Props {
    innerRef: any;
    value: any;
    onChange: any;
}

export interface State {
    value: string;
}

export interface Options {
    decimalSeparator?: string;
    thousandSeparator?: string;
    precision?: number;
}

const defaults: Options = {
    decimalSeparator: ',',
    thousandSeparator: ' ',
    precision: 2,
};

export const createFormattedNumberInput = (InputComponent: any, options: Options = {}) => {
    const opts: any = {
        ...defaults,
        ...options,
    };

    return class FormattedNumberInput extends React.Component<Props, State> {
        el: any;
        caretPosition: number;

        state = {
            value: ''
        };

        parse(value: string) {
            if (value) {
                const cleaned = value
                    .replace(/\s/g, '')
                    .replace(new RegExp(opts.decimalSeparator), '.');

                return parseFloat(cleaned);
            }
        }

        format(value: string) {
            value = value.replace(/[^\d.,]/g, '');

            // only keep the first decimal separator
            value = value
                .replace(/[.,]/, '_')
                .replace(/[.,]/g, '')
                .replace(/_/, opts.decimalSeparator);

            // only keep `opts.precision` fraction digits
            if (value.indexOf(opts.decimalSeparator) !== -1) {
                const [integer, fractional] = value.split(opts.decimalSeparator);
                value = integer + opts.decimalSeparator + fractional.substr(0, opts.precision);
            }

            // separate thousands
            value = value.replace(/\B(?=(\d{3})+(?!\d))/g, opts.thousandSeparator);

            return value;
        }

        handleChange = (event: React.FormEvent<HTMLInputElement>) => {
            const inputted = event.currentTarget.value;
            const formatted = this.format(inputted);
            const parsed = this.parse(formatted);
            const delta = formatted.length - inputted.length;

            this.caretPosition = Math.max(this.el.selectionEnd + delta, 0);
            this.setState({ value: formatted });
            this.props.onChange(parsed);
        }

        setRef = (el: any) => {
            this.el = el;
        }

        componentDidUpdate() {
            this.el.setSelectionRange(this.caretPosition, this.caretPosition);
        }

        render() {
            return (
                <InputComponent
                    innerRef={this.setRef}
                    value={this.format(this.state.value)}
                    onChange={this.handleChange}
                />
            );
        }
    }
};
