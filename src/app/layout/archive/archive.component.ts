import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { Component, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbTypeahead, NgbModal, NgbCalendar, NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';

import * as moment from 'moment';
import { ColumnMode } from '@swimlane/ngx-datatable';

import { Archive } from '@app/shared/models/archive';
import { URL_LIST } from '@app/shared/const/api-urls.const';

import { ToastService } from '@app/shared';
import { routerTransition } from '../../router.animations';
import { APIService } from '../../shared/services/api.service';
import { BaseListViewComponent } from '@app/shared/components/base-list-view.component';

class ChatMedia {
  images: any[];
  videos: any[];
}

@Component({
  selector: 'app-archive',
  templateUrl: './archive.component.html',
  styleUrls: ['./archive.component.scss'],
  animations: [routerTransition()],
})
export class ArchiveComponent extends BaseListViewComponent {
  @Input() fileTypes;
  @Input() hideSnackBar;
  @Input() active = 1;
  archives: Archive[] = [];
  userList: any = [];
  columns = [];
  ColumnMode = ColumnMode;
  chatMedia: ChatMedia = null;
  todayDate;
  loader = false;
  successMessage = '';
  modalLoader = false;
  formSubmitted = false;
  // filePath = this.apiService.baseURL.substring(0, this.apiService.baseURL.length - 1);
  filePath = 'http://commondatastorage.googleapis.com';
  selectedFile = { id: '', filePath: '', type: '', canList: null };
  errorMessage = { type: '', message: '' };
  canList = [true, false];
  reportData = { startDate: null, endDate: null, reported: false, userId: '' };
  files = { images: [], videos: [], imagesNames: [], videosNames: [] };
  addContentForm: FormGroup;

  get f() {
    return this.addContentForm.controls;
  }

  focus$ = new Subject<string>();
  click$ = new Subject<string>();
  @ViewChild('instance') instance: NgbTypeahead;

  constructor(
    public router: Router,
    public apiService: APIService,
    public modalService: NgbModal,
    public toastService: ToastService,
    public config: NgbDropdownConfig,
    private fb: FormBuilder,
    private calendar: NgbCalendar,
  ) {
    super(router, apiService, modalService, toastService);
    let today = new Date();
    config.autoClose = false;
    this.todayDate = { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() };

    const endDate = moment().endOf('month');
    this.reportData['endDate'] = { month: endDate.month(), year: endDate.year(), day: endDate.date() };
  }

  ngOnInit() {
    this.addContentForm = this.fb.group({
      id: ['', [Validators.required]],
      title: ['', [Validators.required]],
      specialIngredient: ['', [Validators.required]],
      // prize: ['', [Validators.required]],
      coverPhoto: ['', [Validators.required]],
      description: ['', [Validators.required]],
    });
    this.getUserList();
    this.getFiles();
  }

  getUserList() {
    this.apiService.postData(URL_LIST.Users.GetUsers, {}).subscribe((response) => (this.userList = response.users));
  }

  getFiles() {
    this.loader = true;
    this.chatMedia = null;
    this.formSubmitted = true;
    this.errorMessage = { type: '', message: '' };

    const data: any = {
      type: this.fileTypes,
      userId: this.reportData.userId || null,
      startDate: this.updatedReportDate(this.reportData.startDate),
      endDate: this.updatedReportDate(this.reportData.endDate),
    };
    if (this.hideSnackBar) {
      data.canList = this.canList;
    }
    if (!this.hideSnackBar) {
      data.reported = this.reportData.reported;
    }

    this.apiService.postData(URL_LIST.Users.GetUserFiles, data).subscribe(
      (response) => {
        this.setMediaData(response);
      },
      (error) => {
        this.loader = false;
        this.errorMessage = { type: 'api', message: 'An error occured.' };
      },
    );
  }

  setMediaData(response) {
    let { chatFiles, status } = response;
    this.loader = false;
    if (status && chatFiles.allFiles) {
      chatFiles = chatFiles.status ? chatFiles : { allFiles: [] };

      this.chatMedia = {
        images: chatFiles.allFiles.filter((file) => file.type === 'image' || file.fileType === 'image'),
        videos: chatFiles.allFiles.filter((file) => file.type === 'video' || file.fileType === 'video'),
      };
    }
  }

  updatedReportDate(date) {
    let updatedDate = null;
    if (date) {
      const { month, day, year } = date;
      updatedDate = moment(`${month}/${day}/${year}`).valueOf();
    }
    return updatedDate;
  }

  openMediaModal(modal, file, type = '') {
    const { id, filePath, canList } = file;
    this.selectedFile = file;
    if (!id && !filePath && !type) {
      this.errorMessage = { type: 'searchId', message: 'File not found.' };
    } else {
      this.modalLoader = false;
      this.errorMessage = { type: '', message: '' };
      this.files = { images: [], videos: [], imagesNames: [], videosNames: [] };
      this.modalService.open(modal, {
        centered: true,
        size: 'lg',
        windowClass: type == 'video' && 'video-modal',
        keyboard: !id || !filePath || !type,
      });
    }
  }

  downloadFile(file) {
    let byteArray = new Uint8Array(file.bufferData.data);
    let anchor = document.createElement('a');
    anchor.href = window.URL.createObjectURL(new Blob([byteArray]));
    anchor.download = `${file.fileName}.${file.fileType}`;
    anchor.target = '_blank';
    document.body.appendChild(anchor);
    anchor.click();
  }

  approveMedia(videoId, actionType, type) {
    console.log(videoId, actionType, type);
  }

  validDataForSave(data) {
    const keysToIgnore = ['id'];
    const dataKeys = Object.keys(data);
    let returnForSave = 'true';

    dataKeys.map((key) => {
      if (returnForSave === 'true') {
        if (!data[key] && !keysToIgnore.includes(key)) {
          returnForSave = 'false';
        }
      }
    });
    return returnForSave;
  }

  onAction(index, modal, action) {
    this.errorMessage = null;
    this.successMessage = null;
    let selected: any = this.archives[index] || {};
    this.selected = {
      action,
      id: selected.id,
      title: selected.title,
      pictures: { coverPhoto: selected.coverPhoto },
    };
    this.addContentForm.reset({
      ...selected,
    });
    this.modalService.open(modal, {
      centered: action == 'delete' ? true : false,
      size: action == 'delete' ? 'sm' : 'lg',
    });
  }

  formSubmit(c) {
    console.log(this.addContentForm.value);
  }

  filterUsers(userId) {
    this.reportData.userId = userId;
  }

  reportContent(mediaOption) {
    mediaOption.close();
    const ids = [...this.selectedRows.map((selectedRow) => selectedRow.id)];
    this.apiService.putJsonData(URL_LIST.Feeds.UpdateFeedStatus, { ids }).subscribe(
      (response) => {
        this.toastService.showSuccess(`${ids.length} feed reported successfully!`);
        this.selectedRows = [];
        this.getFiles();
      },
      (error) => {
        this.loader = false;
        this.toastService.showError(`An error occured.`);
      },
    );
  }

  deleteContent(mediaOption) {
    mediaOption.close();
    const ids = [...this.selectedRows.map((selectedRow) => selectedRow.id)];
    this.apiService.putJsonData(URL_LIST.Feeds.DeleteFeed, { ids, fromUser: false }).subscribe(
      (response) => {
        this.toastService.showSuccess(`${ids.length} feed deleted successfully!`);
        this.selectedRows = [];
        this.getFiles();
      },
      (error) => {
        this.loader = false;
        this.toastService.showError(`An error occured.`);
      },
    );
  }
}
