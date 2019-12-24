import moment from 'moment';

export default class TimeRange {
  constructor(readonly start: moment.Moment, readonly end: moment.Moment) {}
}
