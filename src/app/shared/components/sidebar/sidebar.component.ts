import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { URL_LIST } from '@app/shared/const/api-urls.const';
import { Menu } from '@app/shared/const/menu.const';

import { APIService } from '../../../shared/services/api.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  menu = Menu;
  showMenu: string = '';
  isActive: boolean = false;
  pushRightClass: string = 'push-right';

  constructor(public router: Router, public apiService: APIService) {
    this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd && window.innerWidth <= 992 && this.isToggled()) {
        this.toggleSidebar();
      }
    });
  }

  isToggled(): boolean {
    const dom: Element = document.querySelector('body');
    return dom.classList.contains(this.pushRightClass);
  }

  toggleSidebar() {
    const dom: any = document.querySelector('body');
    dom.classList.toggle(this.pushRightClass);
  }

  callbackFunc(callback) {
    callback && this[callback]();
  }

  onLoggedout() {
    this.apiService.getData(URL_LIST.Auth.LogoutUser).subscribe((response) => {
      if (response.status) {
        localStorage.clear();
        this.router.navigate(['/login']);
      }
    });
  }
}
