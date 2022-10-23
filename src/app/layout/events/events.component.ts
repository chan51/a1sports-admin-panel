import { Observable, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { NgbModal, NgbDate, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';

import * as moment from 'moment';

import { routerTransition } from '../../router.animations';
import { APIService } from '../../shared/services/api.service';
import { URL_LIST } from '@app/shared/const/api-urls.const';
import { Event } from '@app/shared/models/event';
import { Selection } from '@app/shared/models/selection';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from '@app/shared';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
  animations: [routerTransition()],
})
export class EventsComponent implements OnInit {
  moment = moment;

  couponList: any = [
    { code: 'ZOMOTO300', detail: '300 off on zomoto Order' },
    { code: 'ZOMOTO50', detail: '50% Off on zomoto Order' },
  ];
  options: string;
  temp = [];
  skipData = 0;
  events: Event[] = [];
  limitData = 10;
  pageNumber = 0;
  allEvents = [];
  totalEvents = 0;
  userId = this.apiService.userId;
  rules = [];
  maxDate: NgbDate | null;
  minDate: NgbDate | null;

  users = {};
  selected: Selection;
  selectedRow: Event;
  selectedImage: '';
  selectedRows = [];
  columns = [
    { name: 'Challange Name' },
    { name: 'Start Date' },
    { name: 'End Date' },
    { name: 'Prize' },
    { name: 'Special Ingredient' },
    { prop: 'Action' },
  ];
  loadingIndicator: boolean = true;
  @ViewChild('table') table: DatatableComponent;

  loader = false;
  modalLoader = false;
  @Input() showAll;
  @Input() hideSnackBar;
  errorMessage: string;
  successMessage: string;
  imagePath = this.apiService.baseURL;
  private _success = new Subject<string>();

  eventForm: FormGroup;
  keysToIgnore = [];

  get f() {
    return this.eventForm.controls;
  }
  multiMinArrey(n: number): any[] {
    return Array(n);
  }
  multiMaxArrey(n: number): any[] {
    return Array(n);
  }
  constructor(
    public router: Router,
    public apiService: APIService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private calendar: NgbCalendar,
    private toastService: ToastService,
  ) {
    this.maxDate = this.calendar.getNext(this.calendar.getToday(), 'd', 1);
    this.options = 'single';
  }

  ngOnInit() {
    this.eventForm = this.fb.group({
      id: ['', [Validators.required]],
      eventName: ['', [Validators.required]],
      startDate: [this.calendar.getToday(), [Validators.required]],
      endDate: [this.calendar.getToday(), [Validators.required]],
      prize: ['', [Validators.required]],
      eventBanner: ['', [Validators.required]],
      bannerFileType: [''],
      description: ['', [Validators.required]],
      options: ['description', [Validators.required]],
      coupon: ['', [Validators.required]],
      couponDisc: ['', [Validators.required]],
      rules: [[], [Validators.required]],
    });
    this.keysToIgnore = ['id', 'coupon', 'couponDisc'];

    this.getList();
    this.getRules();
    this._success.subscribe((message) => (this.successMessage = message));
  }

  nullData() {
    this.selected = null;
    this.loader = true;
    this.modalLoader = false;
    this.loadingIndicator = true;

    this.temp = [];
    this.events = [];
    this.totalEvents = 0;
  }

  getList(searchKeyword = '') {
    this.nullData();
    const params = {
      limit: 10,
      skip: this.skipData,
      searchKeyword,
    };
    this.apiService.postData(URL_LIST.Events.GetEvents, params).subscribe(
      (response) => {
        this.loader = false;
        this.loadingIndicator = false;
        this.setEvents(response);
      },
      (error) => {
        this.toastService.showError('Please try again!');
        this.loadingIndicator = false;
        this.loader = false;
      },
    );
  }

  getRules() {
    this.apiService.getData(URL_LIST.Events.GetRules).subscribe((response) => {
      this.rules = response.eventRules;
    });
  }

  setEvents(response) {
    if (response.status) {
      this.events = [...response.events];
      this.temp = [...this.events];
      this.allEvents = response.events;
      this.totalEvents = this.events.length;
    }
  }

  setPage(pageInfo) {
    const { offset } = pageInfo;
    this.pageNumber = offset;
    this.skipData = this.limitData * this.pageNumber;
    this.getList();
  }

  onSort(event) {
    /* console.log('Sort Event', event);
    this.loading = true;
    setTimeout(() => {
      const rows = [...this.rows];
      const sort = event.sorts[0];
      rows.sort((a, b) => {
        return a[sort.prop].localeCompare(b[sort.prop]) * (sort.dir === 'desc' ? -1 : 1);
      });

      this.rows = rows;
      this.loading = false;
    }, 1000); */
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    this.getList(val);
  }

  onSelect({ selected }) {
    selected = selected.filter((row) => !row.isSuperAdmin);
    this.selectedRows.splice(0, this.selectedRows.length);
    this.selectedRows.push(...selected);
  }

  shouldCheck(row) {
    return !row.isSuperAdmin;
  }

  arrayFromLength(length) {
    return Array.from({ length: Math.ceil(length / this.limitData) });
  }

  toggleExpandRow(row) {
    this.table.rowDetail.collapseAllRows();
    if (this.selectedRow && this.selectedRow['id'] == row.id) {
      this.selectedRow = null;
      return;
    }
    this.selectedRow = row || {};
    this.table.rowDetail.toggleExpandRow(row);
  }

  onAction(index, modal, action) {
    this.errorMessage = null;
    this.successMessage = null;
    this.updateSelectedEventValue(index, action);

    this.modalService.open(modal, {
      backdrop: 'static',
      centered: action == 'delete' ? true : false,
      size: action == 'delete' ? 'sm' : 'lg',
    });
  }

  updateSelectedEventValue(index, action) {
    let selected: any = this.events[index] ? { ...this.events[index] } : { options: 'description' };
    this.selected = {
      action,
      id: selected.id,
      title: selected.eventName,
      pictures: { eventBanner: selected.eventBanner },
    };

    if (selected.id) {
      const startDate = moment(selected.startDate);
      selected.startDate = {
        year: +startDate.year(),
        month: +('0' + (startDate.month() + 1)).slice(-2),
        day: +('0' + startDate.date()).slice(-2),
      };

      const endDate = moment(selected.endDate);
      selected.endDate = {
        year: +endDate.year(),
        month: +('0' + (endDate.month() + 1)).slice(-2),
        day: +('0' + endDate.date()).slice(-2),
      };
    }
    this.eventForm.reset({
      ...selected,
    });
  }

  handleInputChange(event) {
    var file = event.dataTransfer ? event.dataTransfer.files[0] : event.target.files[0];
    var pattern = /image-*/;
    var reader = new FileReader();
    if (!file.type.match(pattern)) {
      this.errorMessage = 'Picture invalid format';
      return;
    }
    if (parseInt((file.size / 1000000).toFixed(0)) > 3) {
      this.errorMessage = 'Picture size exccedd';
      return;
    }
    reader.onload = this._handleReaderLoaded.bind(this, event.target.files.item(0));
    reader.readAsDataURL(file);
  }

  _handleReaderLoaded(file, e) {
    let reader = e.target;
    this.f.bannerFileType.setValue(file.type);
    this.f.eventBanner.setValue(reader.result);

    this.selected.pictures['eventBannerFile'] = file;
    this.selected.pictures['eventBanner'] = reader.result;
  }

  validDataForSave(data) {
    const dataKeys = Object.keys(data);
    let returnForSave = 'true';

    dataKeys.map((key) => {
      if (returnForSave === 'true') {
        if ((!data[key] || (data[key] && !data[key].toString().length)) && !this.keysToIgnore.includes(key)) {
          returnForSave = 'false';
        }
      }
    });
    return returnForSave;
  }

  getFormattedDate(fieldValue: any, format: any) {
    const { day, month, year } = fieldValue;
    const date = moment(`${day}-${month}-${year}`, 'DD-MM-YYYY').format(`YYYY-MM-DD ${format}`);
    return date;
  }

  async formSubmit(c) {
    if (this.validDataForSave(this.eventForm.value) === 'true') {
      this.modalLoader = true;

      const eventBanner = { photoTargetUrl: this.eventForm.value.eventBanner };
      const eventBannerFile = this.selected.pictures['eventBannerFile'];
      if (eventBannerFile) {
        const eventBannerFileName = eventBannerFile.name;
        const eventBannerFileExt = eventBannerFileName.substr(eventBannerFileName.lastIndexOf('.'), 4);
        const suffixFileName: string = new Date().toISOString().replace(/[:.]/gi, '-');

        const { photoTargetUrl, photoPresignedUrl } = await this.apiService
          .postData(URL_LIST.Events.UploadEventBanner, {
            fileName:
              eventBannerFileName.replace(eventBannerFileExt, '') +
              ' -- ' +
              suffixFileName.toLocaleLowerCase() +
              eventBannerFileExt,
          })
          .toPromise();
        await this.apiService.uploadToS3(photoPresignedUrl, eventBannerFile);
        eventBanner.photoTargetUrl = photoTargetUrl;
      }

      const data = {
        ...this.eventForm.value,
        bannerFileType: this.eventForm.value.bannerFileType || eventBannerFile.type,
        eventBanner: eventBanner.photoTargetUrl,
        startDate: this.getFormattedDate(this.f.startDate.value, '00:00:00'),
        endDate: this.getFormattedDate(this.f.endDate.value, '23:59:59'),
      };

      let url = '';
      let apiSubscriber: any;
      if (this.f.id.value) {
        url = URL_LIST.Events.UpdateEvent;
        apiSubscriber = this.apiService.putData(URL_LIST.Events.UpdateEvent, { data });
      } else {
        delete data.id;
        url = URL_LIST.Events.CreateEvent;
        apiSubscriber = this.apiService.postData(URL_LIST.Events.CreateEvent, { data });
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
    this.apiService.putData(URL_LIST.Events.DeleteEvents, data).subscribe(
      (response) => response.status && (this.getList(), c()),
      (error) => error,
    );
  }

  changePrize(e) {
    console.log(e.target.value);
  }

  updateRules(rule) {
    const rules: any[] = this.f.rules.value || [];
    if (rules.includes(rule)) {
      this.eventForm.controls.rules.setValue(rules.filter((rl) => rl !== rule));
    } else {
      this.eventForm.controls.rules.setValue([...rules, rule]);
    }
  }

  openImageModal(modal, image) {
    this.selectedImage = image;
    this.modalService.open(modal, { centered: true, size: 'lg' });
  }
}
