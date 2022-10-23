import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { URL_LIST } from '@app/shared/const/api-urls.const';

import { APIService } from '../../services/api.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  userProfile: any;
  pushRightClass: string = 'push-right';

  constructor(public router: Router, public apiService: APIService) {
    this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd && window.innerWidth <= 992 && this.isToggled()) {
        this.toggleSidebar();
      }
    });
    this.userProfile = JSON.parse(localStorage.getItem('userProfile'));
  }

  ngOnInit() {}

  isToggled(): boolean {
    const dom: Element = document.querySelector('body');
    return dom.classList.contains(this.pushRightClass);
  }

  toggleSidebar() {
    const dom: any = document.querySelector('body');
    dom.classList.toggle(this.pushRightClass);
  }

  onLoggedout() {
    this.apiService
      .getData(URL_LIST.Auth.LogoutUser)
      .subscribe((response) => {
        if (response.status) {
          localStorage.clear();
          this.router.navigate(['/login']);
        }
      });
  }
}
