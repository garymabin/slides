// @flow

import React from 'react';
import {connect} from 'react-redux';
import url from 'url';
import PropTypes from 'prop-types';
import _ from 'lodash';

import DialogRefluxActions from 'src/shared/actions/dialogRefluxActions';
import * as SharedActions from 'src/shared/actions/sharedActions';
import * as FormDataActions from 'src/shared/actions/formDataActions';
import {history} from 'src/appHistory';
import {ERROR_HEADER, SIMPLE_ERROR_POPUP} from 'src/shared/form/constants/validationErrorTypes';

import type {ComponentType} from 'react';
import type {FormData, FormValidationErrors} from 'src/shared/form/flow-typed/form.types';

type Props = {
  formId: string,
  onSubmit: (*) => {},
  initialFormData: ?FormData,
  formData: ?FormData,
  clearFormDataByIdFn: (formId: string) => void,
  updateFormFieldDataValueFn: (formId: string, fieldName: string, fieldValue: *) => void,
  asyncActionStartFn: () => void,
  asyncActionFinishFn: () => void,
  showErrorHeaderMsgFn: (string) => void,
  hideErrorHeaderMsgFn: () => void
};

type State = {
  errors: FormValidationErrors,
  shouldRenderChildren: boolean
};

type Options = {
  formValidator?: * => * => *,
  defaultValues?: (*) => {[fieldName: string]: *},
  disableFormData?: boolean
};

const defaultOptions = {
  formValidator: () => () => {},
  defaultValues: () => ({}),
  autoClearFormData: false,
  disableFormData: false
};

const withForm = (
  options: Options
) =>
  (Component: *): ComponentType<*> => {
    const {formValidator, defaultValues, disableFormData, autoClearFormData} = _.merge({}, defaultOptions, options);
    class WithForm extends React.Component<Props, State> {
      static childContextTypes = {
        form: PropTypes.object
      }

      constructor(props) {
        super(props);
        this.state = {
          errors: {},
          shouldRenderChildren: false
        };
        this.fields = {};
      }

      getChildContext() {
        const {errors} = this.state;
        return {
          form: {
            onChange: this._onChange,
            clearError: this._clearError,
            register: this.register,
            unregister: this.unregister,
            getDefaultValue: this._getDefaultValue,
            errors,
            formData: this._getFormData()
          }
        };
      }

      componentDidMount() {
        const {formId, clearFormDataByIdFn} = this.props;
        const {location: {search = ''}, action} = history;

        const needClearFormData = _.toBoolean(_.get(url.parse(search, true), 'query.clearFormData', true));
        if(needClearFormData && (action === 'PUSH' || action === 'REPLACE')) {
          clearFormDataByIdFn(formId);
        }
        this.setState({shouldRenderChildren: true});
      }

      componentWillUnmount() {
        this._hideHeaderError();
        if (disableFormData) {
          this.props.clearFormDataByIdFn(this.props.formId);
        }
      }

      fields: {
        [fieldName: string]: number}

      register = (fieldName: string) => {
        if (_.isNumber(this.fields[fieldName])) {
          this.fields[fieldName] += 1;
        } else {
          this.fields[fieldName] = 1;
        }
      }

      unregister = (fieldName: string) => {
        this.fields[fieldName] -= 1;
      }

      _getFormData = () => {
        const {initialFormData, formData} = this.props;
        return _.merge({}, this._getDefaultValues(), initialFormData, formData);
      }

      _getDefaultValues = () => {
        return defaultValues ? defaultValues(this.props) : {};
      }

      _getDefaultValue = (fieldName: string) => {
        const defaultValue = this._getDefaultValues()[fieldName];
        return _.isUndefined(defaultValue) ? '' : defaultValue;
      }

      _getRegisteredFormDataWithDefaultValues = () => {
        const formData = this._getFormData();
        const formDataDefaultValues = this._getDefaultValues();
        return _.chain(this.fields)
          .pickBy((count) => count > 0)
          .mapValues((count, fieldName) =>
            _.isUndefined(formData[fieldName]) ? (formDataDefaultValues[fieldName] || '') : formData[fieldName]
          ).value();
      }

      _onChange = (fieldName: string, fieldValue: *) => {
        const {errors} = this.state;
        this.props.updateFormFieldDataValueFn(this.props.formId, fieldName, fieldValue);
        this.setState({
          errors: _.omit(errors, fieldName)
        });
      }

      _getFirstErrorByType(errors, type: string) {
        return _.chain(errors)
          .pickBy((error) => error.type === type)
          .toPairs()
          .first()
          .thru((error) => error ? {key: error[0], error: error[1]} : null)
          .value();
      }

      _handleValidationErrors = (formData, errors) => {
        if (!_.isEmpty(errors)) {
          const headerError = this._getFirstErrorByType(errors, ERROR_HEADER);
          const simplePopupError = this._getFirstErrorByType(errors, SIMPLE_ERROR_POPUP);
          if (headerError) {
            this.props.showErrorHeaderMsgFn(headerError.error.msg);
          } else if (simplePopupError) {
            this._showSimpleErrorPopup(simplePopupError.key, simplePopupError.error);
          }
          return this.setState({
            errors
          });
        }
        this.props.onSubmit(formData);
        autoClearFormData && this.props.clearFormDataByIdFn(this.props.formId);
      }

      _onSubmit = () => {
        const {asyncActionStartFn, asyncActionFinishFn} = this.props;
        this._hideHeaderError();
        const formDataWithDefaultValue = this._getRegisteredFormDataWithDefaultValues();
        const formDataWithTrimmedValue = _.mapValues(
          formDataWithDefaultValue,
          (fieldValue, fieldName) => (_.isString(fieldValue) && !/.*password.*/i.test(fieldName)) ? _.trim(fieldValue) : fieldValue
        );

        const validatorResult = formValidator(this.props)(formDataWithTrimmedValue);

        if (_.isPromise(validatorResult)) {
          asyncActionStartFn();
          validatorResult
            .then((errors) => this._handleValidationErrors(formDataWithTrimmedValue, errors))
            .finally(() => {
              asyncActionFinishFn();
            });
        } else {
          this._handleValidationErrors(formDataWithTrimmedValue, validatorResult);
        }
      }

      _showSimpleErrorPopup(key: string, error: {type: string, msg: *}) {
        DialogRefluxActions.show({
          name: key,
          title: error.msg
        });
      }

      _clearError = (fieldName: string, clearValue: boolean = true) => {
        const {errors} = this.state;
        const hasError = !_.isEmpty(errors[fieldName]);

        if (hasError) {
          if (clearValue) {
            this.props.updateFormFieldDataValueFn(this.props.formId, fieldName, this._getDefaultValue(fieldName));
          }

          this.setState({
            errors: _.omit(errors, fieldName)
          });
        }
      }

      _hideHeaderError() {
        this.props.hideErrorHeaderMsgFn();
      }

      render() {
        return this.state.shouldRenderChildren && (
          <Component
            formData={this._getFormData()}
            onSubmit={this._onSubmit}
            onChange={this._onChange}
            {..._.omit(this.props, 'onSubmit', 'formData', 'updateFormFieldDataValueFn')}
          />
        );
      }
    }

    const mapStateToProps = (state, props) => {
      const {formId} = props;
      return {
        formData: _.get(state.app.formData, `${formId}.data`)
      };
    };

    const mapDispatchToProps = {
      clearFormDataByIdFn: FormDataActions.clearFormDataById,
      updateFormFieldDataValueFn: FormDataActions.updateFormFieldDataValue,
      asyncActionStartFn: SharedActions.asyncActionStart,
      asyncActionFinishFn: SharedActions.asyncActionFinish,
      showErrorHeaderMsgFn: SharedActions.showErrorHeaderMsg,
      hideErrorHeaderMsgFn: SharedActions.hideErrorHeaderMsg
    };

    return connect(mapStateToProps, mapDispatchToProps)(WithForm);
  };

export default withForm;
