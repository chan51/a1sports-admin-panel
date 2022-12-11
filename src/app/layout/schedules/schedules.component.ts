import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, Input, ViewChild } from '@angular/core';

import { Subject } from 'rxjs';
import * as moment from 'moment';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NgbModal, NgbDate, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';

import { Schedule } from '@app/shared/models/schedule';
import { Selection } from '@app/shared/models/selection';
import { URL_LIST } from '@app/shared/const/api-urls.const';

import { ToastService } from '@app/shared';
import { routerTransition } from '@app/router.animations';
import { APIService } from '@app/shared/services/api.service';

@Component({
  selector: 'app-schedules',
  templateUrl: './schedules.component.html',
  styleUrls: ['./schedules.component.scss'],
  animations: [routerTransition()],
})
export class SchedulesComponent implements OnInit {
  moment = moment;

  temp = [];
  skipData = 0;
  schedules: Schedule[] = [];
  limitData = 10;
  pageNumber = 0;
  allSchedules = [];
  totalSchedules = 0;
  userId = this.apiService.userId;
  maxDate: NgbDate | null;
  allTeams = [];

  users = {};
  selected: Selection;
  selectedRows = [];
  columns = [{ name: 'TeamAName' }, { name: 'TeamBName' }, { name: 'Date' }, { prop: 'Action' }];
  loadingIndicator: boolean = true;
  @ViewChild('table') table: DatatableComponent;

  loader = false;
  modalLoader = false;
  @Input() showAll;
  @Input() hideSnackBar;
  errorMessage: string;
  successMessage: string;
  private _success = new Subject<string>();

  scheduleForm: FormGroup;
  searchValue: Subject<any> = new Subject<any>();

  get f() {
    return this.scheduleForm.controls;
  }

  constructor(
    public router: Router,
    public apiService: APIService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private calendar: NgbCalendar,
    private toastService: ToastService,
  ) {
    this.maxDate = this.calendar.getToday();
  }

  ngOnInit() {
    this.scheduleForm = this.fb.group({
      id: [''],
      teamAId: ['', [Validators.required]],
      teamAName: ['', [Validators.required]],
      teamBId: ['', [Validators.required]],
      teamBName: ['', [Validators.required]],
      date: [this.calendar.getToday(), [Validators.required]],
    });

    this.getList();
    this.getTeamNames();

    this._success.subscribe((message) => (this.successMessage = message));
    this.searchValue.pipe(debounceTime(500), distinctUntilChanged()).subscribe((event) => this.updateFilter(event));
  }

  nullData() {
    this.selected = null;
    this.loader = true;
    this.modalLoader = false;
    this.selectedRows = [];
    this.loadingIndicator = true;

    this.temp = [];
    this.schedules = [];
    this.totalSchedules = 0;
  }

  getList(searchKeyword = '') {
    this.nullData();
    const params = {
      limit: 10,
      skip: this.skipData,
      searchKeyword,
    };
    this.apiService.postData(URL_LIST.Schedules.GetSchedules, params).subscribe(
      (response) => {
        this.loader = false;
        this.loadingIndicator = false;
        this.setSchedules(response);
      },
      (error) => {
        this.toastService.showError('Please try again!');
        this.loadingIndicator = false;
        this.loader = false;
      },
    );
  }

  setSchedules(response) {
    if (response.status) {
      this.schedules = [...response.schedules];
      this.temp = [...this.schedules];
      this.allSchedules = response.schedules;
      this.totalSchedules = this.schedules.length;
    }
  }

  getTeamNames() {
    this.apiService
      .getData(URL_LIST.Players.GetTeamNames)
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((response) => {
        this.allTeams = response.allTeams;
      });
  }

  setPage(pageInfo) {
    const { offset } = pageInfo;
    this.pageNumber = offset;
    this.skipData = this.limitData * this.pageNumber;
    this.getList();
  }

  onSort(schedule) {
    /* console.log('Sort Schedule', schedule);
    this.loading = true;
    setTimeout(() => {
      const rows = [...this.rows];
      const sort = schedule.sorts[0];
      rows.sort((a, b) => {
        return a[sort.prop].localeCompare(b[sort.prop]) * (sort.dir === 'desc' ? -1 : 1);
      });

      this.rows = rows;
      this.loading = false;
    }, 1000); */
  }

  updateFilter(event) {
    this.getList(event.target.value.toLowerCase());
  }

  onSelect({ selected }) {
    selected = selected.filter((row) => !row.isSuperAdmin);
    this.selectedRows.splice(0, this.selectedRows.length);
    this.selectedRows.push(...selected);
  }

  arrayFromLength(length) {
    return Array.from({ length: Math.ceil(length / this.limitData) });
  }

  onAction(index, modal, action) {
    this.errorMessage = null;
    this.successMessage = null;
    this.updateSelectedScheduleValue(index, action);

    this.modalService.open(modal, {
      backdrop: 'static',
      centered: action == 'delete' ? true : false,
      size: action == 'delete' ? 'sm' : 'lg',
    });
  }

  updateSelectedScheduleValue(index, action) {
    let selected: any = this.schedules[index] ? { ...this.schedules[index] } : {};
    this.selected = {
      action,
      title: '',
      id: selected.id,
    };

    if (selected.id) {
      const date = moment(selected.date);
      selected.date = {
        year: +date.year(),
        month: +('0' + (date.month() + 1)).slice(-2),
        day: +('0' + date.date()).slice(-2),
      };
    }
    this.scheduleForm.reset({
      ...selected,
    });
  }

  teamChangeEvent(teamId, controlName) {
    const team = this.allTeams.find((team) => team.name === teamId);
    this.scheduleForm.get(controlName).setValue(team.name);
  }

  validDataForSave(data) {
    const dataKeys = Object.keys(data);
    let returnForSave = 'true';

    dataKeys.map((key) => {
      if (returnForSave === 'true' && key !== 'id') {
        if (!data[key] || (data[key] && !data[key].toString().length)) {
          returnForSave = 'false';
        }
      }
    });
    return returnForSave;
  }

  getFormattedDate(fieldValue: any) {
    const { day, month, year } = fieldValue;
    const date = moment(`${day}-${month}-${year}`, 'DD-MM-YYYY').format(`YYYY-MM-DD`);
    return date;
  }

  async formSubmit(c) {
    if (this.validDataForSave(this.scheduleForm.value) === 'true') {
      this.modalLoader = true;

      const data = {
        ...this.scheduleForm.value,
        date: this.getFormattedDate(this.f.date.value),
      };

      let url = '';
      let apiSubscriber: any;
      if (this.f.id.value) {
        url = URL_LIST.Schedules.UpdateSchedule;
        apiSubscriber = this.apiService.putData(URL_LIST.Schedules.UpdateSchedule, { data });
      } else {
        delete data.id;
        url = URL_LIST.Schedules.CreateSchedule;
        apiSubscriber = this.apiService.postData(URL_LIST.Schedules.CreateSchedule, { data });
      }
      apiSubscriber.subscribe(
        (response) => {
          if (response.status) {
            this.getList();
            c();
          } else {
            this.errorMessage = response.message || 'An error occured.';
            this.modalLoader = false;
          }
        },
        (error) => (this.modalLoader = false),
      );
    } else {
      this.toastService.showWarning('Please enter all details...');
    }
  }

  onDelete(c) {
    const data = {
      data: {
        ids: this.selected.id,
      },
    };
    this.apiService.putData(URL_LIST.Schedules.DeleteSchedules, data).subscribe(
      (response) => response.status && (this.getList(), c()),
      (error) => error,
    );
  }
}
