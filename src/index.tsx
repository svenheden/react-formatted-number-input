import * as React from 'react';

export interface Props {
    value?: number;
    onChange: (value?: number) => void;
}

export interface State {
    formattedValue: string;
}

export interface Options {
    decimalSeparator: string;
    thousandSeparator: string;
    precision: number;
    allowNegativeValues: boolean;
}

const defaults: Options = {
    decimalSeparator: ',',
    thousandSeparator: ' ',
    precision: 2,
    allowNegativeValues: false,
};

export function createFormattedNumberInput<ExternalProps>(InputComponent: any, options: Partial<Options> = {}): React.ComponentClass<ExternalProps | Props> {
    const opts: Options = {
        ...defaults,
        ...options,
    };

    const parse = (value: string) => {
        if (value) {
            const cleaned = value
                .replace(/\s/g, '')
                .replace(new RegExp(opts.decimalSeparator), '.');

            const number = parseFloat(cleaned);
    
            return !isNaN(number) ? number : undefined;
        }
    }
    
    const format = (value: string) => {
        value = value.replace(opts.allowNegativeValues ? /[^\d.,-]/g : /[^\d.,]/g, '');

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

    return class FormattedNumberInput extends React.Component<Props & ExternalProps, State> {
        private ref = React.createRef<HTMLInputElement>();
        private caretPosition: number = 0;
        state: State = { formattedValue: '' };

        static getDerivedStateFromProps(nextProps: Props & ExternalProps, prevState: State) {
            const formattedValue = format(String(nextProps.value));
            const prevFormattedValueWithoutSpecialCharacters = prevState.formattedValue
                .replace(new RegExp(`${opts.decimalSeparator}0$`), '')
                .replace(new RegExp(`[${opts.decimalSeparator}-]`), '');

            if (formattedValue !== prevFormattedValueWithoutSpecialCharacters) {
                return { formattedValue };
            }

            return null;
        }

        componentDidUpdate(prevProps: Props & ExternalProps) {
            if (this.ref.current && prevProps.value !== this.props.value) {
                this.ref.current.setSelectionRange(this.caretPosition, this.caretPosition);
            }
        }

        private handleChange = (event: React.FormEvent<HTMLInputElement>) => {
            const inputted = event.currentTarget.value;
            const formatted = format(inputted);
            const parsed = parse(formatted);
            const delta = formatted.length - inputted.length;

            this.caretPosition = this.ref.current && this.ref.current.selectionEnd
                ? Math.max(this.ref.current.selectionEnd + delta, 0)
                : 0;

            this.setState({ formattedValue: formatted }, () => {
                this.props.onChange(parsed);
            });
        }

        render() {
            return (
                <InputComponent
                    {...this.props}
                    ref={this.ref}
                    value={this.state.formattedValue}
                    onChange={this.handleChange}
                />
            );
        }
    }
};
