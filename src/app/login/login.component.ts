import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { routerTransition } from '../router.animations';
import { APIService } from '../shared/services/api.service';
import { URL_LIST } from '@app/shared/const/api-urls.const';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [routerTransition()],
})
export class LoginComponent {
  loader = false;
  loginForm = { loginName: '', password: '' };
  alert = { label: 0, type: 'warning', message: '' };
  constructor(public router: Router, public apiService: APIService) {}

  doLogin() {
    if (this.loginForm.loginName == '') {
      this.alert = { label: 1, type: 'warning', message: 'Login name is required.' };
    } else if (this.loginForm.password == '') {
      this.alert = { label: 2, type: 'warning', message: 'Password is required.' };
    } else {
      if (this.loginForm.loginName.length < 3) {
        this.alert = { label: 3, type: 'warning', message: 'Login name length should be greater than 3.' };
      } else if (this.loginForm.password.length < 3) {
        this.alert = { label: 4, type: 'warning', message: 'Password length should be greater than 3.' };
      } else {
        this.loader = true;
        this.apiService.postData(URL_LIST.Auth.LoginUser, this.loginForm).subscribe(
          (response) => this.gotoHome(response),
          (error) => this.gotoHome(error),
        );
      }
    }
  }

  gotoHome(response) {
    this.loader = false;
    if (response.status) {
      localStorage.setItem('loginId', response.id);
      localStorage.setItem('userProfile', JSON.stringify(response));
      this.apiService.updateOptions(this.router);
      this.router.navigate(['/dashboard']);
    } else {
      this.alert = { label: 5, type: 'danger', message: response.message || 'An error occured' };
    }
  }
}
