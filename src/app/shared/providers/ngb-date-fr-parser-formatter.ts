import { Injectable } from '@angular/core';

import * as moment from 'moment';
import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Injectable()
export class NgbDateFRParserFormatter extends NgbDateParserFormatter {
  parse(value: string): NgbDateStruct {
    const date = moment(value.toString());
    return {
      year: parseInt(date.format('YYYY')),
      month: parseInt(date.format('MM')),
      day: parseInt(date.format('DD')),
    };
  }

  format(date: NgbDateStruct): string {
    if (date) {
      const day = date.day > 9 ? date.day : '0' + date.day;
      const month = date.month > 9 ? date.month : '0' + date.month;
      return day + '/' + month + '/' + date.year;
    } else {
      return '';
    }
  }
}
