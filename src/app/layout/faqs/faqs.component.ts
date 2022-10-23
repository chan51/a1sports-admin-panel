import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { debounceTime } from 'rxjs/operators';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import { Page } from '../../shared/classes/page.class';
import { routerTransition } from '../../router.animations';
import { APIService } from '../../shared/services/api.service';
import { URL_LIST } from '@app/shared/const/api-urls.const';

@Component({
  selector: 'app-faqs',
  templateUrl: './faqs.component.html',
  styleUrls: ['./faqs.component.scss'],
  animations: [routerTransition()],
})
export class FAQsComponent implements OnInit {
  temp = [];
  skipData = 0;
  FAQs = [];
  limitData = 10;
  pageNumber = 0;
  totalFAQs = 0;
  userId = this.apiService.userId;

  selected = {};
  selectedRow = {};
  selectedRows = [];
  columns = [{ name: 'Title' }, { name: 'Description' }, { name: 'Action' }];
  loadingIndicator: boolean = true;
  @ViewChild('table') table: DatatableComponent;

  loader = false;
  modalLoader = false;
  @Input() showAll;
  @Input() hideSnackBar;
  errorMessage: string;
  private _success = new Subject<string>();
  constructor(public router: Router, public apiService: APIService, private modalService: NgbModal) {}

  ngOnInit() {
    this.getList();
  }

  nullData() {
    this.selected = {};
    this.loader = true;
    this.modalLoader = false;
    this.loadingIndicator = true;

    this.temp = [];
    this.FAQs = [];
    this.totalFAQs = 0;
  }

  getList(val?) {
    this.nullData();
    const params = {
      limit: 10,
      skip: this.skipData,
    };
    this.apiService.postData(URL_LIST.FAQs.GetFAQs, params).subscribe(
      (response) => {
        this.loader = false;
        this.loadingIndicator = false;
        if (response.status) {
          this.temp = [...response.faqs];
          this.FAQs = response.faqs;
          this.totalFAQs = response.faqsLength;
        }
      },
      (error) => {
        alert('Please try again!');
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
    if (this.selectedRow['id'] == row.id) {
      this.selectedRow = {};
      return;
    }
    this.selectedRow = row || {};
    this.table.rowDetail.toggleExpandRow(row);
  }

  onAction(type, index, modal, action) {
    this.errorMessage = null;
    let selected = JSON.stringify(this.FAQs[index] || {});
    this.selected = JSON.parse(selected);
    this.selected['action'] = action;
    this.modalService.open(modal, { centered: type == 'delete' ? true : false, size: type == 'delete' ? 'sm' : 'lg' });
  }

  validateForm() {
    if (!this.selected['title'] || this.selected['title'] == '') {
      this.errorMessage = 'Title is required.';
      return;
    } else if (!this.selected['desc'] || this.selected['desc'] == '') {
      this.errorMessage = 'Description is required.';
      return;
    }
    return true;
  }

  formSubmit(c) {
    if (this.validateForm()) {
      this.modalLoader = true;
      let data = JSON.stringify(this.selected);
      data = JSON.parse(data);
      let urlPath = data['action'] == 'edit' ? URL_LIST.FAQs.UpdateFAQ : URL_LIST.FAQs.CreateFAQ;
      let urlFunc = data['action'] == 'edit' ? 'putData' : 'postData';
      delete data['action'];
      delete data['createdAt'];
      delete data['updatedAt'];

      this.apiService[urlFunc](urlPath, { data: data }).subscribe(
        (response) => (response.status ? (this.getList(), c()) : (this.modalLoader = false)),
        (error) => (this.modalLoader = false),
      );
    }
  }

  onDelete(c) {
    this.apiService.deleteData('deleteFAQ?faqId=' + this.selected['id']).subscribe(
      (response) =>
        response.status ? (this.getList(), c()) : this._success.next(response.message || 'An error occured.'),
      (error) => error,
    );
  }
}
