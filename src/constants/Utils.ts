// @flow

import moment from 'moment';
import DateTime from './DateTime';
import type { Days } from '../../models/types';

export type Duration='short'|'long'|'indefinite';

export default {
  _getInitials: function(fullname: string) {
    let out = '';
    if (fullname && fullname !== ''){
    out += fullname.split(' ')[0].charAt(0);
    if (fullname.split(' ')[1]) {
      out += fullname.split(' ')[1].charAt(0);
    }
  }
    return out;
  },
  _humanReadableDays: function(days: Days): string {
    let output = '';
    Object.keys(days).map((item, key) => (days[item] > 0 ? (output += item + ',') : ''));

    return output;
  },
  _humanReadableDaysFromCron: function(days: string): string {
    let output = '';
    let len = days.length;
    for (var i = 0; i < len; i++) {
      Number(days[i]) > 0
        ? (output +=
            moment()
              .day(Number(days[i]))
              .format(DateTime.dayFormat) + ',')
        : '';
    }

    return output;
  },

  _humanReadableTime: function(startTime: number, weekly: boolean): string {
    if (weekly) {
      return moment
        .utc()
        .hour(0)
        .minute(0)
        .second(0)
        .add(startTime, 'ms')
        .local()
        .format(DateTime.timeFormat);
    } else {
      return moment
        .unix(startTime / 1000)
        .local()
        .format(DateTime.timeFormat);
    }
  },
  _humanReadableDate: function(startTime: number): string {
    return moment
      .unix(startTime / 1000)
      .local()
      .format(DateTime.dateFormat);
  },

  _daysInCronFormat: function(days: Days): string {
    let output = '';
    Object.keys(days).map((item, key) => (days[item] > 0 ? (output += '' + key) : ''));
    return output;
  },

  _DaysFromCron: function(days: string, passengers: number) {
    let output: Days = { sun: 0, mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0 };

    let len = days.length;

    for (var i = 0; i < len; i++) {
      let numericalDay = Number(days[i]);

      let dayWord = moment()
        .day(numericalDay)
        .format(DateTime.dayFormat)
        .toLocaleLowerCase();
      output[dayWord] = passengers;
    }
    return output;
  },
};
