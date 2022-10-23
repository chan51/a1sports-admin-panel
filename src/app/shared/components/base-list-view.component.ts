import { Injectable, OnInit, OnChanges, ViewChild, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { APIService } from '@app/shared/services';
import { ToastService } from '@app/shared';
import { Selection } from '@app/shared/models/selection';

@Injectable()
export class BaseListViewComponent implements OnInit, OnChanges {
  params: any;
  url: string = '';
  data: any[] = [];
  skipData = 0;
  limitData = 10;
  hideSnackBar: boolean = false;
  setData: EventEmitter<any> = new EventEmitter<any>();
  onActionData: EventEmitter<any> = new EventEmitter<any>();

  temp = [];
  totalData = 0;
  pageNumber = 0;
  userType: any = '';
  userId = this.apiService.userId;

  password = '';
  selected: Selection;
  selectedRows = [];
  selectedRow: any = null;
  selectedImage = '';
  loadingIndicator: boolean = true;
  @ViewChild('table') table: DatatableComponent;

  loader = false;
  imagePath = this.apiService.baseURL;

  constructor(
    public router: Router,
    public apiService: APIService,
    public modalService: NgbModal,
    public toastService: ToastService,
  ) {}

  ngOnInit() {
    if (this.params) {
      this.getList();
    }
  }

  ngOnChanges(changes: any) {
    // console.log(changes)
    // console.log(this.data)
  }

  nullData() {
    this.selected = null;
    this.loader = true;
    this.loadingIndicator = true;

    this.temp = [];
    this.data = [];
    this.totalData = 10;
  }

  getList(searchKeyword = '') {
    this.nullData();
    const params = {
      ...this.params,
      searchKeyword,
    };
    this.apiService.postData(this.url, params).subscribe(
      (response) => {
        this.loader = false;
        this.loadingIndicator = false;
        this.setData.emit(response);
      },
      (error) => {
        this.toastService.showError('Please try again!');
        this.loadingIndicator = false;
        this.loader = false;
      },
    );
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

  onSelect({ selected }) {
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
    if (this.selectedRow['id'] == row.id) {
      this.selectedRow = null;
      return;
    }
    this.selectedRow = row || {};
    this.table.rowDetail.toggleExpandRow(row);
  }

  onAction(index, modal, action) {
    let selected: any = this.data[index] || {};
    this.selected = {
      action,
      id: selected.id,
      title: selected.title,
      pictures: { profile: selected.profile },
    };

    const data = {
      index,
      modal,
      action,
      selected: this.selected,
    };
    this.onActionData.emit(data);
  }
}
