// @flow

import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Field from 'src/shared/components/field';
import FieldErrorMessage from 'src/shared/components/fieldErrorMessage';

type Props = {
  name: string,
  fieldLabel?: string,
  fieldClassName?: string,
  onChange?: (*) => void
};

type Options = {
  format?: (fieldValue: *) => *,
  parse?: (...*) => *
}

const withField = ({
  format = (value) => value,
  parse = (value) => value
}: Options = {}) =>
  (Component: *) => {
    class WithField extends React.Component<Props> {

      static contextTypes = {
        form: PropTypes.shape({
          onChange: PropTypes.func.isRequired,
          clearError: PropTypes.func.isRequired,
          register: PropTypes.func.isRequired,
          unregister: PropTypes.func.isRequired,
          errors: PropTypes.object.isRequired,
          formData: PropTypes.object.isRequired,
          getDefaultValue: PropTypes.func.isRequired
        })
      }

      componentWillMount() {
        const {name} = this.props;
        this.context.form.register(name);
      }

      componentWillUnmount() {
        const {name} = this.props;
        this.context.form.unregister(name);
      }

      _onChange = (...args: *) => {
        const {name, onChange} = this.props;
        const value = parse(...args);
        onChange && onChange(value);
        this.context.form.onChange(name, value);
      }

      render() {
        const {formData, errors, clearError, getDefaultValue} = this.context.form;
        const {fieldLabel, name, fieldClassName, ...restProps} = this.props;
        const value = _.isUndefined(formData[name]) ? getDefaultValue(name) : formData[name];
        const error = errors[name];
        const hasError = !_.isEmpty(error);

        return (
          <Field
            className={fieldClassName}
            label={fieldLabel}
            error={hasError}
          >
            <Component
              onChange={this._onChange}
              clearError={() => clearError(name)}
              value={format(value)}
              name={name}
              error={error}
              {..._.omit(restProps, 'defaultValue', 'onChange')}
            />
            {hasError ? <FieldErrorMessage error={error} /> : null}
          </Field>
        );
      }
    }
    return WithField;
  };

export default withField;
