import { setLabTestsSaga, resetState, clear } from '../../app/js/sagas/labOrdersSaga';
import {
  FETCH_LAB_ORDERS,
  SET_LAB_TEST,
  SET_CONCEPT,
  SET_LAB_ORDERS,
} from '../../app/js/actions/actionTypes';

let sagaTester;


const { SagaTester } = global;
const data = {
  results: [
    {
      orderNumber: "ORD-1",
      concept: {
        display: "Hémogramme automatisé",
        names: [
          {
            "display": "Hémogramme automatisé",
            "uuid": "f95db7c1-4623-4875-b5b8-931ccefb069e",
            "name": "Hémogramme automatisé",
            "locale": "en",
            "localePreferred": true,
            "conceptNameType": "SHORT",
          }
        ]
      },
      urgency: 'ROUTINE',
      dateActivated: "2018-08-30T17:34:19.000+0100",
      patient: {
        display: "Y2A7LR - williams willy john",
      },
    },
  ],
};

describe('setLabTestsSaga', () => {
  beforeEach(() => {
    sagaTester = new SagaTester({});
    sagaTester.start(setLabTestsSaga);
  });
  it('should dispatch SET_LAB_TEST', () => {
    const expectedActions = [
      `${FETCH_LAB_ORDERS}_SUCCESS`,
      SET_LAB_ORDERS,
      SET_LAB_TEST,
    ];

    sagaTester.dispatch({ type: `${FETCH_LAB_ORDERS}_SUCCESS`, payload: { data } });

    expect(
      sagaTester.getCalledActions().map(
        action => action.type,
      ),
    ).toEqual(expectedActions);
    expect(sagaTester.wasCalled(`${FETCH_LAB_ORDERS}_SUCCESS`)).toEqual(true);
  });
});

describe('resetState saga', () => {
  beforeEach(() => {
    sagaTester = new SagaTester({});
    sagaTester.start(resetState);
  });
  it('should run', () => {
    const expectedActions = [
      `${FETCH_LAB_ORDERS}_SUCCESS`,
      SET_CONCEPT,
    ];

    sagaTester.dispatch({ type: `${FETCH_LAB_ORDERS}_SUCCESS`, payload: { data } });

    expect(
      sagaTester.getCalledActions().map(
        action => action.type,
      ),
    ).toEqual(expectedActions);
    expect(sagaTester.wasCalled(`${FETCH_LAB_ORDERS}_SUCCESS`)).toEqual(true);
  });
});
