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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Player } from '@app/shared/models/players';
import { IDropdownSettings } from 'ng-multiselect-dropdown';

@Component({
  selector: 'app-players',
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.scss'],
  animations: [routerTransition()],
})
export class PlayersComponent implements OnInit {
  temp = [];
  players: Player[] = [];
  skipData = 0;
  limitData = 10;
  totalPlayers = 0;
  pageNumber = 0;
  playerType: any = '';
  userId = this.apiService.userId;

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

  days = [];
  todayDate;
  loader = false;
  modalLoader = false;
  @Input() showAll;
  @Input() hideSnackBar;
  errorMessage: string;
  imagePath = this.apiService.baseURL;

  playerForm: FormGroup;
  searchValue = '';

  get f() {
    return this.playerForm.controls;
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
    this.dropdownLists();
  }

  setForms() {
    this.playerForm = this.fb.group({
      id: ['', [Validators.required]],
      name: ['', [Validators.required]],
      team: ['', [Validators.required]],
      role: ['', [Validators.required]],
      value: ['', [Validators.required]],
    });
  }

  nullData() {
    this.selected = null;
    this.loader = true;
    this.modalLoader = false;
    this.loadingIndicator = true;

    this.temp = [];
    this.players = [];
    this.players = [];
    this.totalPlayers = 0;
  }

  getList() {
    this.nullData();
    const params = {
      limit: 10,
      skip: this.skipData,
      searchKeyword: this.searchValue,
      allPlayers: true,
    };
    this.apiService.postData(URL_LIST.Players.GetPlayers, params).subscribe(
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
      this.players = response.players;
      this.totalPlayers = this.hideSnackBar ? this.limitData : response.playersLength;
    }
  }

  dropdownLists() {
    this.dropdownList = {
      teams: [
        { id: 'India', value: 'India' },
        { id: 'australia', value: 'Australia' },
        { id: 'Pakistan', value: 'Pakistan' },
        { id: 'South Africa', value: 'South Africa' },
        { id: 'New Zealand', value: 'New Zealand' },
        { id: 'Sri Lanka', value: 'Sri Lanka' },
        { id: 'England', value: 'England' },
        { id: 'West Indies', value: 'West Indies' },
        { id: 'Zimbabwe', value: 'Zimbabwe' },
        { id: 'Bangladesh', value: 'Bangladesh' },
        { id: 'Namibia', value: 'Namibia' },
        { id: 'Ireland', value: 'Ireland' },
        { id: 'Canada', value: 'Canada' },
        { id: 'Netherlands', value: 'Netherlands' },
        { id: 'Scotland', value: 'Scotland' },
        { id: 'Afghanistan', value: 'Afghanistan' },
        { id: 'United Arab Emirates', value: 'United Arab Emirates' },
      ],
      roles: [
        { id: 'All-Rounder', value: 'All-Rounder' },
        { id: 'Bowler', value: 'Bowler' },
        { id: 'Batter', value: 'Batter' },
        { id: 'Wicket-Keeper', value: 'Wicket-Keeper' },
      ],
    };
  }

  filterPlayers(playerType) {
    this.playerType = playerType;
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
    this.searchValue = event.target.value.toLowerCase();
    this.getList();
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
    let selected: any = this.players[index] || {};
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
}
