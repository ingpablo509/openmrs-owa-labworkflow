import types from 'redux-types';

const BASIC_TYPES = [
  'SUCCEEDED',
  'FAILED',
  'REQUESTED',
];

export default {
  SET_PATIENT: types('set_patient', BASIC_TYPES),
};
export const FETCH_LAB_ORDERS = 'FETCH_LAB_ORDERS';
export const SET_LAB_TEST = 'SET_LAB_TEST';
export const SET_SELECTED_PATIENT = 'SET_SELECTED_PATIENT';
export const ADD_PATIENT = 'ADD_PATIENT';
export const FETCH_LAB_CONCEPT = 'FETCH_LAB_CONCEPT';
export const FETCH_LAB_RESULTS_ENCOUNTER_TYPE = 'FETCH_LAB_RESULTS_ENCOUNTER_TYPE';
export const FETCH_LAB_RESULTS_DATE_CONCEPT = 'FETCH_LAB_RESULTS_DATE_CONCEPT';
export const GET_DATE = 'GET_DATE';
export const SET_CONCEPT_MEMBER = 'SET_CONCEPT_MEMBER';
export const SET_FETCH_STATUS = 'SET_FETCH_STATUS';
export const SET_CONCEPT = 'SET_CONCEPT';
export const FETCH_LAB_RESULTS_DID_NOT_PERFORM_QUESTION = 'FETCH_LAB_RESULTS_DID_NOT_PERFORM_QUESTION';
export const FETCH_LAB_RESULTS_DID_NOT_PERFORM_REASON = 'FETCH_LAB_RESULTS_DID_NOT_PERFORM_REASON';
export const FETCH_LAB_RESULTS_DID_NOT_PERFORM_ANSWER = 'FETCH_LAB_RESULTS_DID_NOT_PERFORM_ANSWER';
export const FETCH_LAB_RESULTS_TEST_ORDER_NUMBER_CONCEPT = 'FETCH_LAB_RESULTS_TEST_ORDER_NUMBER_CONCEPT';
export const FETCH_PATIENT_LAB_TEST_RESULTS = 'FETCH_PATIENT_LAB_TEST_RESULTS';
export const SET_PATIENT_DATA = 'SET_PATIENT_DATA';
export const FETCH_CONCEPT = 'FETCH_CONCEPT';
export const FETCH_CONCEPT_SUCCEEDED = 'FETCH_CONCEPT_SUCCEEDED';
export const FETCH_CONCEPT_FAILED = 'FETCH_CONCEPT_FAILED';
