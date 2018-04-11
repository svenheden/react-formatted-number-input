import * as React from 'react';

export interface Props {
    value?: number;
    onChange: (value?: number) => void;
}

export interface State {
    formattedValue: string;
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

export function createFormattedNumberInput<ExternalProps>(InputComponent: any, options: Options = {}): React.ComponentClass<Props & ExternalProps> {
    const opts: any = {
        ...defaults,
        ...options,
    };

    return class FormattedNumberInput extends React.Component<Props & ExternalProps, State> {
        private el: any;
        private caretPosition: number = 0;

        constructor(props: Props & ExternalProps) {
            super(props);

            this.state = {
                formattedValue: props.value == null ? '' : this.format(String(props.value))
            };
        }

        componentWillReceiveProps(nextProps: Props & ExternalProps) {
            const newFormattedValue = this.format(String(nextProps.value));
            const currentFormattedValueWithoutTrailingDecimalSeparator = this.state.formattedValue.replace(new RegExp(`${opts.decimalSeparator}$`), '');

            if (newFormattedValue !== currentFormattedValueWithoutTrailingDecimalSeparator) {
                this.setState({
                    formattedValue: nextProps.value == null ? '' : newFormattedValue
                });
            }
        }

        componentDidUpdate(prevProps: Props & ExternalProps) {
            if (this.el && prevProps.value !== this.props.value) {
                this.el.setSelectionRange(this.caretPosition, this.caretPosition);
            }
        }

        private parse(value: string) {
            if (value) {
                const cleaned = value
                    .replace(/\s/g, '')
                    .replace(new RegExp(opts.decimalSeparator), '.');

                return parseFloat(cleaned);
            }
        }

        private format(value: string) {
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

        private handleChange = (event: React.FormEvent<HTMLInputElement>) => {
            const inputted = event.currentTarget.value;
            const formatted = this.format(inputted);
            const parsed = this.parse(formatted);
            const delta = formatted.length - inputted.length;

            this.caretPosition = Math.max(this.el.selectionEnd + delta, 0);

            this.setState({ formattedValue: formatted }, () => {
                this.props.onChange(parsed);
            });
        }

        private setRef = (el: any) => {
            this.el = el;
        }

        render() {
            return (
                <InputComponent
                    {...this.props}
                    innerRef={this.setRef}
                    value={this.state.formattedValue}
                    onChange={this.handleChange}
                />
            );
        }
    }
};
