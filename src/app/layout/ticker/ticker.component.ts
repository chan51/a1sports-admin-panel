import { Router } from '@angular/router';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { NgbModal, NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';

import * as moment from 'moment';
import { routerTransition } from '../../router.animations';
import { APIService } from '../../shared/services/api.service';
import { URL_LIST } from '@app/shared/const/api-urls.const';
import { ToastService } from '@app/shared';
import { Selection } from '@app/shared/models/selection';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Player } from '@app/shared/models/players';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { PlayerRoles } from '@app/shared/const/player-roles.const';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { of, Subject } from 'rxjs';

@Component({
  selector: 'app-ticker',
  templateUrl: './ticker.component.html',
  styleUrls: ['./ticker.component.scss'],
  animations: [routerTransition()],
})
export class TickerComponent implements OnInit {
  temp = [];
  tickers: Player[] = [];
  skipData = 0;
  limitData = 10;
  totalTickers = 0;
  allTeams = [];
  pageNumber = 0;
  teamName: any = '';
  userId = this.apiService.userId;
  tickerRequest = null;

  dropdownList = {
    roles: [],
    teams: [],
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
  selectedRow: Player = null;
  selectedImage = '';
  approvePlayerData;
  columns = [{ name: 'Name' }, { name: 'Team' }, { name: 'Coin' }, { prop: 'Action' }];
  loadingIndicator: boolean = true;
  @ViewChild('table') table: DatatableComponent;
  updatedPlayersStatus = null;
  updatedPlayersTicker = '';

  days = [];
  todayDate;
  loader = false;
  modalLoader = false;
  @Input() showAll;
  @Input() hideSnackBar;
  errorMessage: string;
  imagePath = this.apiService.baseURL;

  playerForm: FormGroup;
  searchValue: Subject<any> = new Subject<any>();

  get f() {
    return this.playerForm.controls;
  }

  isNumberCheck(): ValidatorFn {
    return (c: AbstractControl): { [key: string]: boolean } | null => {
      let isValidNumber = /^\d{0,2}\.?\d{0,2}$/g.test(c.value);
      return isValidNumber ? null : { value: isValidNumber };
    };
  }

  constructor(
    public router: Router,
    public apiService: APIService,
    public modalService: NgbModal,
    private fb: FormBuilder,
    public config: NgbDropdownConfig,
    public toastService: ToastService,
  ) {
    config.autoClose = false;
  }

  ngOnInit() {
    this.setForms();
    this.getList();
    this.getTeamNames();

    this.searchValue.pipe(debounceTime(500), distinctUntilChanged()).subscribe((event) => this.updateFilter(event));
  }

  setForms() {
    this.playerForm = this.fb.group({
      id: [''],
      name: ['', [Validators.required]],
      team: ['', [Validators.required]],
      role: ['', [Validators.required]],
      value: ['', [Validators.required, this.isNumberCheck()]],
    });
  }

  nullData() {
    this.selected = null;
    this.loader = true;
    this.modalLoader = false;
    this.loadingIndicator = true;
    this.selectedRows = [];
    this.updatedPlayersStatus = null;
    this.updatedPlayersTicker = '';

    this.temp = [];
    this.tickers = [];
    this.totalTickers = 0;

    if (this.tickerRequest) {
      this.tickerRequest.unsubscribe();
    }
  }

  getList(searchKeyword = '') {
    this.nullData();
    const params = {
      limit: this.teamName ? null : 10,
      skip: this.skipData,
      searchKeyword: searchKeyword || this.teamName,
      allPlayers: true,
      teamName: this.teamName,
      growth: this.teamName ? false : true,
    };
    this.tickerRequest = this.apiService
      .postData(URL_LIST.Players.GetPlayers, params)
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(
        (response) => {
          this.loader = false;
          this.loadingIndicator = false;
          this.setPlayers(response);
        },
        (error) => {
          this.toastService.showError('Please try again!');
          this.loadingIndicator = false;
          this.loader = false;
        },
      );
  }

  setPlayers(response) {
    if (response.status) {
      response.players.map((player) => {
        player.status = player.status == 1 ? 'Active' : 'Inactive';
      });
      this.temp = [...response.players];
      this.tickers = response.players;
      this.selectedRows = [...this.tickers.filter((player) => player.growth)];

      this.teamName && (this.limitData = response.playersLength);
      this.totalTickers = this.hideSnackBar ? this.limitData : response.playersLength;
    }
  }

  getTeamNames() {
    this.apiService
      .getData(URL_LIST.Players.GetTeamNames)
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((response) => {
        this.dropdownList = {
          teams: response.allTeams,
          roles: PlayerRoles,
        };
      });
  }

  filterPlayers(teamName) {
    if (teamName) {
      this.limitData = null;
    } else {
      this.limitData = 10;
    }
    this.teamName = teamName;
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
    this.getList(event.target.value.toLowerCase());
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
    return Array.from({ length: Math.ceil(length / this.limitData || length) });
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
    this.updatedPlayersStatus = null;
    this.updatedPlayersTicker = '';
    let selected: any = this.tickers[index] || {};
    this.selected = {
      action,
      id: selected.id,
      title: selected.title,
      pictures: { profile: selected.profile },
    };

    this.playerForm.reset({
      ...selected,
    });
    this.password = this.selected['password'];

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
    if (this.validDataForSave(this.playerForm.value) === 'true') {
      this.modalLoader = true;
      const data = {
        ...this.playerForm.value,
        value: this.playerForm.value.value,
      };

      let url = '';
      let apiSubscriber: any;
      if (this.f.id.value) {
        url = URL_LIST.Players.UpdatePlayer;
        apiSubscriber = this.apiService.putData(URL_LIST.Players.UpdatePlayer, { data });
      } else {
        delete data.id;
        url = URL_LIST.Players.CreatePlayer;
        apiSubscriber = this.apiService.postData(URL_LIST.Players.CreatePlayer, { data });
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
    this.apiService.putData(URL_LIST.Players.DeletePlayers, data).subscribe(
      (response) => response.status && (this.getList(), c()),
      (error) => error,
    );
  }

  onApprove(c) {
    const data = {
      data: {
        ids: [...this.selectedRows.map((selectedRow) => selectedRow.id)],
        isEnable: this.updatedPlayersStatus === 'true',
      },
    };
    this.apiService.putData(URL_LIST.Players.UpdatePlayersStatus, data).subscribe(
      (response) => response.status && (this.getList(), c()),
      (error) => error,
    );
  }

  onUpdateTicker(c) {
    const data = {
      data: {
        ids: [...this.selectedRows.map((selectedRow) => selectedRow.id)],
        growth: this.updatedPlayersTicker,
      },
    };
    this.apiService.putData(URL_LIST.Players.UpdatePlayersTicker, data).subscribe(
      (response) => response.status && (this.getList(), c()),
      (error) => error,
    );
  }
}
