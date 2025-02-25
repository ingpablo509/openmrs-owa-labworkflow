/* * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
import React, { PureComponent } from 'react';
import R from 'ramda';
import { connect } from 'react-redux';
import cn from 'classnames';
import moment from 'moment';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage } from 'react-intl';
import swal from 'sweetalert';
import { SortableTable, Loader } from '@openmrs/react-components';
import LabOrderListFilters from './LabOrdersListFilters';
import { fetchLabOrders, cancelOrder, printLabel } from '../actions/labOrdersAction';
import { setSelectedConcept } from '../actions/labConceptsAction';
import { filterThrough, calculateTableRows, getConceptShortName, computeResultStatus, isCancelable } from '../utils/helpers';
import { loadGlobalProperties, selectProperty } from '../utils/globalProperty';
import filtersAction from '../actions/filtersAction';
import patientAction from '../actions/patientAction';
import "../../css/lab-orders-list.scss";


const Cell = ({ columnName, value, handleCancel, cancelMsg, enableLabelPrinting, handlePrint, printMsg, locale }) => {
  switch (columnName) {
    case 'EMR ID': {
      // TODO: refactor this and name column to use React Components patientUtils
      const emrID = value.patient.display.split('-')[0].trim();
      return (
        <div className="table_cell emr-id">
          <span>{emrID}</span>
        </div>
      );
    }
    case 'NAME': {
      const displayName = value.patient.display.split('-')[1].trim();
      return (
        <div className="table_cell name">
          <span>{displayName}</span>
        </div>
      );
    }
    case 'ORDER ID':
      return (
        <div className="table_cell order-id">
          <span>{value.orderNumber}</span>
        </div>
      );
    case 'STATUS':
      return (
        <div className="table_cell status">
          <span>
            <FormattedMessage
              id={"app.labResult.status." + computeResultStatus(value)}
              defaultMessage={computeResultStatus(value)}
            />
          </span>
        </div>
      );
    case 'ORDER DATE':
      return (
        <div className="table_cell order-date">
          <span>{moment(value.dateActivated).format("DD-MMM-YYYY")}</span>
        </div>
      );
    case 'URGENCY': {
      const urgencyClassName = cn({
        table_cell: true,
        urgency: true,
        stat: value.urgency === 'STAT',
        routine: value.urgency === 'ROUTINE',
      });
      return (
        <div className={urgencyClassName}>
          <span>{value.urgency}</span>
        </div>
      );
    }
    case 'TEST TYPE':
      return (
        <div className="table_cell test-type">
          <span>{getConceptShortName(value.concept, locale)}</span>
        </div>
      );
    case 'ACTIONS':
      const printLabel =
        <div className="order-actn-btn">
            <span
              className="glyphicon glyphicon-print tooltips"
              data-tooltip={ printMsg }
              aria-hidden="true"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handlePrint(value);
              }}
            />
        </div>
      ;
      let cancelOrder = null;
      if (isCancelable(value)) {
        cancelOrder =
          <div className="order-actn-btn">
            <span
              className="glyphicon glyphicon-remove tooltips"
              data-tooltip={ cancelMsg }
              aria-hidden="true"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCancel(value);
              }}
            />
          </div>
        ;
      }
      return (
        <div className="actions-container">
          { enableLabelPrinting === 'true' ? printLabel : ''}
          { cancelOrder }
        </div>
      );
    default:
      return null;
  }
};

export class LabOrdersList extends PureComponent {
  constructor(props) {
    super(props);

    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.clearNameEMRField = this.clearNameEMRField.bind(this);
    this.handleShowResultsEntryPage = this.handleShowResultsEntryPage.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handlePrintLabel = this.handlePrintLabel.bind(this);

    this.state = {
      returnUrl: new URLSearchParams(location.search).get('returnUrl'),
    };
  }

  componentDidMount() {
    const { dispatch, labResultsTestOrderType } = this.props;
    loadGlobalProperties(dispatch);
    dispatch(patientAction.setSelectedPatient(''));
    dispatch(setSelectedConcept(''));
    if (labResultsTestOrderType) {
      this.loadOrders();
    }
  }

  componentWillReceiveProps(nextProps) {
    const { dispatch, labResultsTestOrderType, labOrdersListFilters } = this.props;
    if (nextProps.labResultsTestOrderType !== labResultsTestOrderType) {
      this.loadOrders();
    }
  }

  loadOrders() {
    const { dispatch, labResultsTestOrderType, labOrdersListFilters } = this.props;
    const options = {
      dateToField: moment(labOrdersListFilters.dateToField).format('YYYY-MM-DD'),
      dateFromField: moment(labOrdersListFilters.dateFromField).format('YYYY-MM-DD'),
    };
    dispatch(fetchLabOrders(labResultsTestOrderType, options));
  }

  handleShowResultsEntryPage(order) {
    const unclickableStatuses = ["CANCELED", "EXPIRED"];
    if (!unclickableStatuses.includes(computeResultStatus(order))) {
      const { history, returnUrl } = this.props;
      history.push({
        pathname: "/LabResultEntry",
        state: order,
        returnUrl,
      });
    }
  }

  clearNameEMRField() {
    const { dispatch, labOrdersListFilters } = this.props;
    const newFilters = {
      ...labOrdersListFilters,
      nameField: "",
    };
    dispatch(filtersAction.setLabOrdersListFilters(newFilters));
  }

  async handlePrintLabel(order) {
    const {
      sessionLocation,
      labelPrintingEndpoint,
      dispatch,
      intl,
    } = this.props;

    const printMsg = intl.formatMessage({ id: "app.lab.print.label", defaultMessage: "Print Lab Label ?" });
    const yesMsg = intl.formatMessage({ id: "reactcomponents.yes", defaultMessage: "YES" });
    const noMsg = intl.formatMessage({ id: "reactcomponents.no", defaultMessage: "NO" });
    const printConfirmation = await swal(printMsg, {
      buttons: {
        YES: yesMsg,
        NO: noMsg,
      },
    });
    if (printConfirmation === "YES") {
      const patient = {
        patient: order.patient.uuid,
        sessionLocation: sessionLocation.uuid,
        url: labelPrintingEndpoint,
      };

      dispatch(printLabel(patient));
    }
  }

  async handleCancel(order) {
    const {
      currentProvider,
      dispatch,
      intl,
    } = this.props;
    const cancelMsg = intl.formatMessage({ id: "app.lab.discontinue.question", defaultMessage: "Are you sure you would like to cancel this order ?" });
    const yesMsg = intl.formatMessage({ id: "reactcomponents.yes", defaultMessage: "YES" });
    const noMsg = intl.formatMessage({ id: "reactcomponents.no", defaultMessage: "NO" });
    const cancelConfirmation = await swal(cancelMsg, {
      buttons: {
        YES: yesMsg,
        NO: noMsg,
      },
    });
    if (cancelConfirmation === "YES") {
      const cancelledOrder = {
        careSetting: order.careSetting,
        concept: order.concept.uuid,
        patient: order.patient.uuid,
        encounter: order.encounter.uuid,
        action: "DISCONTINUE",
        orderer: currentProvider.uuid,
        previousOrder: order.uuid,
        type: "testorder",
        urgency: order.urgency,
      };

      dispatch(cancelOrder(cancelledOrder));
    }
  }

  handleFilterChange(field, value) {
    const { dispatch, labOrdersListFilters, labResultsTestOrderType } = this.props;
    let newFilters = {
      ...labOrdersListFilters,
      [field]: value,
    };
    if (field === 'nameField' || field === 'testStatusField' || field === 'testTypeField') {
      // defaults page to zero when a user starts typing
      newFilters = {
        ...newFilters,
        ['page']: 0,
      };
    }
    if (field === 'dateToField') {
      const options = {
        dateToField: value,
        dateFromField: moment(labOrdersListFilters.dateFromField).format('YYYY-MM-DD'),
      };
      dispatch(fetchLabOrders(labResultsTestOrderType, options));
    }
    if (field === 'dateFromField') {
      const options = {
        dateToField: moment(labOrdersListFilters.dateToField).format('YYYY-MM-DD'),
        dateFromField: value,
      };
      dispatch(fetchLabOrders(labResultsTestOrderType, options));
    }
    dispatch(filtersAction.setLabOrdersListFilters(newFilters));
  }

  renderNoDataDisplayText() {
    const { labOrdersListFilters } = this.props;

    const fromDate = `${moment(labOrdersListFilters.dateFromField).format('YYYY-MMM-DD')}`;
    const toDate = `${moment(labOrdersListFilters.dateToField).format('YYYY-MMM-DD')}`;
    return (
      <div className="no-data-container">
        <span>
          <FormattedMessage
            id="app.orders.not.found"
            defaultMessage="No orders found"
            description="No orders found" />
          &nbsp;
          <FormattedMessage
            id="app.from.label"
            defaultMessage="from"
            description="from" />
          &nbsp;
          { fromDate }
          &nbsp;
          <FormattedMessage
            id="app.to.label"
            defaultMessage="to"
            description="to" />
          &nbsp;
          { toDate }
        </span>
      </div>
    );
  }

  renderDraftOrderTable() {
    const {
      orders,
      dateAndTimeFormat,
      labOrdersListFilters,
      enableLabelPrinting,
      fetched,
      intl,
      locale,
} = this.props;
    const fields = ["EMR ID", "NAME", "ORDER ID", "ORDER DATE", "STATUS", "URGENCY", "TEST TYPE", "ACTIONS"];

    const noDataMessage = intl.formatMessage({ id: "app.orders.not.found", defaultMessage: "No orders found" });
    const rowsMessage = intl.formatMessage({ id: "reactcomponents.table.rows", defaultMessage: "Rows" });
    const cancelMsg = intl.formatMessage({ id: "reactcomponents.cancel", defaultMessage: "Cancel" });
    const printMsg = intl.formatMessage({ id: "reactcomponents.print", defaultMessage: "Print" });

    const columnMetadata = fields.map(columnName => ({
      Header:
  <span className="labs-order-table-head">
    <FormattedMessage
      id={`app.labOrdersList.${columnName.replace(" ", "_")}`}
      defaultMessage={`${columnName}`}
      description={`LabOrderList table header for ${columnName}`} />
  </span>,
      accessor: "",
      filterAll: true,
      Cell: data => <Cell {...data} columnName={columnName} handleCancel={this.handleCancel} cancelMsg={cancelMsg} enableLabelPrinting={ enableLabelPrinting } handlePrint={this.handlePrintLabel} printMsg={ printMsg } locale={locale}/>,
      className: `lab-order-list-cell-${columnName.replace(' ', '-').toLocaleLowerCase()}`,
      headerClassName: `lab-order-list-column-header lab-order-list-header-${columnName.replace(' ', '-').toLocaleLowerCase()}`,
    }));
    return (
      <div className="lab-order-list">
        <SortableTable
          data={orders}
          filters={labOrdersListFilters}
          locale={locale}
          getDataWithFilters={filterThrough}
          columnMetadata={columnMetadata}
          loading={!fetched}
          filteredFields={fields}
          filterType="none"
          showFilter={false}
          isSortable={false}
          onPageChange={page => this.handleFilterChange('page', page)}
          onPageSizeChange={pageSize => this.handleFilterChange('pageSize', pageSize)}
          rowOnClick={this.handleShowResultsEntryPage}
          noDataMessage={ noDataMessage }
          rowsText={ rowsMessage }
          minRows={0}
          page={labOrdersListFilters.page}
          defaultPageSize={labOrdersListFilters.pageSize || calculateTableRows(orders.length)}
        />
      </div>
    );
  }

  render() {
    const {
      labTests, orders, fetched, labOrdersListFilters: {
        dateFromField, dateToField, nameField, testTypeField, testStatusField,
      },
    } = this.props;
    const {
      returnUrl,
    } = this.state;
    const hasData = !R.isEmpty(orders) && !R.isEmpty(labTests);
    return (
      <div className="main-container">
        <h2>
          <FormattedMessage
            id="app.labOrdersList.title"
            defaultMessage="Labs"
            description="Welcome header on LabTestResult page" />
        </h2>
        <React.Fragment>
          <LabOrderListFilters
            handleFieldChange={this.handleFilterChange}
            clearNameEMRField={this.clearNameEMRField}
            labTests={labTests}
            testTypeField={testTypeField}
            testStatusField={testStatusField}
            dateFromField={moment(dateFromField)}
            dateToField={moment(dateToField)}
            nameField={nameField}
          />
          {!fetched && <Loader />}
          {(hasData && fetched) && this.renderDraftOrderTable()}
          {(!hasData && fetched) && this.renderNoDataDisplayText()}
          {returnUrl && (
            <div>
              <br />
              <br />
              <button className="cancel" type="button" onClick={() => window.location.assign(returnUrl)}>Return</button>
            </div>
          )}
        </React.Fragment>
      </div>
    );
  }
}

LabOrdersList.propTypes = {
  orders: PropTypes.array.isRequired,
  labTests: PropTypes.array.isRequired,
  dateAndTimeFormat: PropTypes.string.isRequired,
};

export const mapStateToProps = state => ({
  orders: state.labOrders.orders,
  labTests: state.labOrders.labTests,
  dateAndTimeFormat: selectProperty(state, 'dateAndTimeFormat') || '',
  labResultsTestOrderType: selectProperty(state, 'labResultsTestOrderType') || '',
  enableLabelPrinting: selectProperty(state, 'enableLabelPrinting') || '',
  labelPrintingEndpoint: selectProperty(state, 'labelPrintingEndpoint') || '',
  labOrdersListFilters: state.filters.labOrdersListFilters,
  fetched: state.labOrders.fetched,
  currentProvider: state.openmrs.session.currentProvider,
  sessionLocation: state.openmrs.session.sessionLocation,
  locale: state.openmrs.session.locale,
});

const LabOrdersListContainer = (
  propsFromState,
  Component,
) => withRouter(connect(propsFromState)(Component));

export default injectIntl(LabOrdersListContainer(mapStateToProps, LabOrdersList));
