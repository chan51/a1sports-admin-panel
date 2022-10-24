import { Observable, Subject, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { map, catchError, takeUntil } from 'rxjs/operators';

@Injectable()
export class APIService {
  httpOptions = {
    headers: new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ssid: this.userId || '',
    }),
  };
  // public baseURL = 'http://192.168.214.208:1410/';
  public baseURL = 'https://sportyfy.io/a1sports/';

  logoutHitted = false;
  unsub: Subject<any> = new Subject();

  get userId() {
    return localStorage.getItem('loginId');
  }

  constructor(public router: Router, public http: HttpClient) {}

  // post verb for login user
  public loginuser(path, data): Observable<any> {
    return this.http.post(this.baseURL + path, JSON.stringify(data), this.httpOptions).pipe(
      map(this.extractData),
      catchError((error) => this.handleError(error)),
    );
  }

  updateOptions(router) {
    this.httpOptions = {
      headers: new HttpHeaders({
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ssid: this.userId || '',
      }),
    };
  }

  // get verb for get data
  public getData(path, params?): Observable<any> {
    return this.http.get(this.baseURL + path, this.httpOptions).pipe(
      map(this.extractData),
      catchError((error) => this.handleError(error)),
    );
  }

  // post verb for create data
  public postData(path, data): Observable<any> {
    return this.http.post(this.baseURL + path, JSON.stringify(data), this.httpOptions).pipe(
      map(this.extractData),
      catchError((error) => this.handleError(error)),
    );
  }

  // put verb for update data
  public putData(path, data): Observable<any> {
    return this.http.put(this.baseURL + path, JSON.stringify(data), this.httpOptions).pipe(
      map(this.extractData),
      catchError((error) => this.handleError(error)),
    );
  }

  // delete verb for delete data
  public deleteData(path): Observable<any> {
    return this.http.delete(this.baseURL + path, this.httpOptions).pipe(
      map(this.extractData),
      catchError((error) => this.handleError(error)),
    );
  }

  // post verb for create data
  public postFile(path, data): Observable<any> {
    return this.http.post(this.baseURL + path, JSON.stringify(data), this.httpOptions).pipe(
      map(this.extractData),
      catchError((error) => this.handleError(error)),
    );
  }

  // put verb for update data from json
  public putJsonData(path, data): Observable<any> {
    return this.http.put(this.baseURL + path, data, this.httpOptions).pipe(
      map(this.extractData),
      catchError((error) => this.handleError(error)),
    );
  }

  private extractData(res: any) {
    try {
      let body = res.json();
      if (body.error) return this.handleError(body.error);
      else return body.data || body;
    } catch (e) {
      return res;
    }
  }

  private handleError(error: any) {
    if (error.status === 401 && !this.logoutHitted) {
      this.logoutHitted = true;
      this.postData('logoutUser', { data: { id: localStorage.getItem('loginId') } })
        .pipe(takeUntil(this.unsub))
        .subscribe(
          (response) => {
            localStorage.clear();
            this.router.navigate(['/login']);
          },
          (err) => {
            localStorage.clear();
            this.router.navigate(['/login']);
          },
        );
    }
    return throwError(error.error);
  }

  async uploadToS3(signedUrl: string, fileUrl: string) {
    return this.http.put(signedUrl, fileUrl).toPromise();
  }
}
