import { Router } from '@angular/router';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { NgbModal, NgbDropdownConfig, NgbCalendar, NgbDate } from '@ng-bootstrap/ng-bootstrap';

import * as moment from 'moment';
import { routerTransition } from '../../router.animations';
import { APIService } from '../../shared/services/api.service';
import { URL_LIST } from '@app/shared/const/api-urls.const';
import { ToastService } from '@app/shared';
import { Selection } from '@app/shared/models/selection';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '@app/shared/models/user';
import { IDropdownSettings } from 'ng-multiselect-dropdown';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  animations: [routerTransition()],
})
export class UsersComponent implements OnInit {
  temp = [];
  users: User[] = [];
  skipData = 0;
  limitData = 10;
  totalUsers = 0;
  pageNumber = 0;
  userType: any = '';
  maxDate: NgbDate | null;
  userId = this.apiService.userId;

  dropdownList = {
    genders: [],
    status: [],
    userTypes: [],
  };
  dropdownSettings: IDropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'value',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: false,
    closeDropDownOnSelection: true,
  };

  password = '';
  selected: Selection;
  selectedRows = [];
  selectedRow: User = null;
  selectedImage = '';
  approveUserData;
  columns = [{ name: 'Name' }, { name: 'Login Name' }, { name: 'User Type' }, { name: 'Status' }, { prop: 'Action' }];
  loadingIndicator: boolean = true;
  @ViewChild('table') table: DatatableComponent;

  days = [];
  todayDate;
  loader = false;
  modalLoader = false;
  @Input() showAll;
  @Input() hideSnackBar;
  errorMessage: string;
  imagePath = this.apiService.baseURL;

  userForm: FormGroup;
  addContentForm: FormGroup;

  get f() {
    return this.userForm.controls;
  }

  get fAC() {
    return this.addContentForm.controls;
  }

  constructor(
    public router: Router,
    public apiService: APIService,
    public modalService: NgbModal,
    private fb: FormBuilder,
    private calendar: NgbCalendar,
    public config: NgbDropdownConfig,
    public toastService: ToastService,
  ) {
    let today = new Date();
    config.autoClose = false;
    this.maxDate = this.calendar.getToday();
    this.todayDate = { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() };
    for (let d = 1; d < 31; d++) this.days.push(d);
  }

  ngOnInit() {
    this.setForms();
    this.getList();
    this.dropdownLists();
  }

  setForms() {
    this.userForm = this.fb.group({
      id: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      mobile: ['', [Validators.maxLength(10)]],
      email: [''],
      loginName: ['', [Validators.required]],
      password: ['', [Validators.required]],
      // gender: ['', [Validators.required]],
      // dob: ['', [Validators.required]],
      // profile: [''],
      status: ['', [Validators.required]],
      userType: ['', [Validators.required]],
    });

    this.addContentForm = this.fb.group({
      id: [''],
      userId: ['', [Validators.required]],
      userName: ['', [Validators.required]],
      fileType: ['', [Validators.required]],
      people: ['', [Validators.required]],
      location: ['', [Validators.required]],
      description: ['', [Validators.required]],
    });
  }

  nullData() {
    this.selected = null;
    this.loader = true;
    this.modalLoader = false;
    this.loadingIndicator = true;

    this.temp = [];
    this.users = [];
    this.totalUsers = 0;
  }

  getList(searchKeyword = '') {
    this.nullData();
    const params = {
      limit: 10,
      skip: this.skipData,
      userType: this.userType,
      searchKeyword,
    };
    this.apiService.postData(URL_LIST.Users.GetUsers, params).subscribe(
      (response) => {
        this.loader = false;
        this.loadingIndicator = false;
        this.setUsers(response);
      },
      (error) => {
        this.toastService.showError('Please try again!');
        this.loadingIndicator = false;
        this.loader = false;
      },
    );
  }

  setUsers(response) {
    if (response.status) {
      response.users.map((user) => {
        user.status = user.status == 1 ? 'Active' : 'Inactive';
      });
      this.temp = [...response.users];
      this.users = response.users;
      this.totalUsers = this.hideSnackBar ? this.limitData : response.usersLength;
    }
  }

  dropdownLists() {
    this.dropdownList = {
      genders: [
        { id: 'male', value: 'Male' },
        { id: 'female', value: 'Female' },
        { id: 'others', value: 'Others' },
      ],
      status: [
        { id: 1, value: 'Active' },
        { id: 0, value: 'Inactive' },
      ],
      userTypes: [
        { id: 'user', value: 'User' },
        { id: 'admin', value: 'Admin' },
      ],
    };
  }

  filterUsers(userType) {
    this.userType = userType;
    this.getList();
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
      this.selectedRow = null;
      return;
    }
    this.selectedRow = row || {};
    this.table.rowDetail.toggleExpandRow(row);
  }

  onAction(index, modal, action) {
    this.errorMessage = null;
    let selected: any = this.users[index] || {};
    this.selected = {
      action,
      id: selected.id,
      title: selected.title,
      pictures: { profile: selected.profile },
    };

    if (action === 'addContent') {
      const content = {
        userId: selected.id,
        userName: selected.name,
      };
      this.addContentForm.patchValue(content);
    } else {
      this.userForm.reset({
        ...selected,
      });
      this.password = this.selected['password'];
    }

    this.modalService.open(modal, {
      centered: action == 'delete' ? true : false,
      size: action == 'delete' ? 'sm' : 'lg',
    });
  }

  openImageModal(modal, image) {
    this.selectedImage = image;
    this.modalService.open(modal, { centered: true, size: 'lg' });
  }

  handleInputChange(e, key) {
    var file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
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
    reader.onload = this._handleReaderLoaded.bind(this, key);
    reader.readAsDataURL(file);
  }

  _handleReaderLoaded(key, e) {
    let reader = e.target;
    this.f.profile.setValue(reader.result);
  }

  validDataForSave(data) {
    const keysToIgnore = ['id', 'mobile', 'email', 'profile'];
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

  getFormattedDate(fieldValue: any) {
    const { day, month, year } = fieldValue;
    const date = moment(`${day}-${month}-${year}`, 'DD-MM-YYYY').format('DD-MM-YYYY');
    return date;
  }

  getListValue(field: any) {
    return this.f[field].value.map((data) => data.id).join();
  }

  formSubmit(c) {
    if (this.validDataForSave(this.userForm.value) === 'true') {
      this.modalLoader = true;
      const data = {
        ...this.userForm.value,
        loginName: this.f.loginName.value.toLocaleLowerCase(),
        gender: this.getListValue('gender'),
        status: parseInt(this.getListValue('status')),
        userType: this.getListValue('userType'),
        dob: this.getFormattedDate(this.f.dob.value),
      };

      let url = '';
      let apiSubscriber: any;
      if (this.f.id.value) {
        url = URL_LIST.Users.UpdateUser;
        apiSubscriber = this.apiService.putData(URL_LIST.Users.UpdateUser, { data });
      } else {
        url = URL_LIST.Users.CreateUser;
        apiSubscriber = this.apiService.postData(URL_LIST.Users.CreateUser, { data });
      }
      apiSubscriber.subscribe(
        (response) => {
          response.status
            ? (this.getList(), c())
            : ((this.errorMessage = response.message || 'An error occured.'), (this.modalLoader = false));
        },
        (error) => (this.modalLoader = false),
      );
    }
  }

  onDelete(c) {
    const data = {
      data: {
        ids: this.selected.id,
      },
    };
    this.apiService.putData(URL_LIST.Users.DeleteUsers, data).subscribe(
      (response) => response.status && (this.getList(), c()),
      (error) => error,
    );
  }

  approveMedia(userId, status, modal) {
    this.approveUserData = {
      userId,
      status,
    };
    this.modalService.open(modal, {
      centered: true,
      size: 'sm',
    });
  }

  onApprove(c) {
    const data = {
      data: {
        ids: [this.approveUserData.userId],
        status: this.approveUserData.status,
      },
    };
    this.apiService.putData(URL_LIST.Users.ApproveUsers, data).subscribe(
      (response) => response.status && (this.getList(), c()),
      (error) => error,
    );
  }
}
