import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { ConfigService } from './config.service';

let MD5 = require("blueimp-md5");

@Injectable()
export class LeancloundService {

  constructor(
    private http: Http,
    private configService: ConfigService,
  ) { }

  private _url(url: string): string {
    return "https://api.leancloud.cn/1.1/" + url;
  }

  private _headers(): Headers {
    let sessionToken = localStorage.getItem("sessionToken") || undefined;
    let currentTimestamp = new Date().getTime();
    let sign = MD5(currentTimestamp+this.configService.leancloundConfig.AppKey);
    let options = new Headers({
      'Content-Type': 'application/json',
      "X-LC-Id": this.configService.leancloundConfig.AppID,
      "X-LC-Sign": sign+","+currentTimestamp,
    });
    if (!!sessionToken) {
      options.append("X-LC-Session", sessionToken);
    }
    return options;
  }

  private handleError (error: Response | any) {
    // In a real world app, we might use a remote logging infrastructure
    let errMsg: string;
    let errStatus: number = -1;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
      errStatus = error.status || -1;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(`${errStatus} : ${errMsg}`);
    return Observable.throw({status: errStatus, message: errMsg});
  }

  public createObject(data: Object): Observable<any> {
    let body = JSON.stringify(data);
    let headers = this._headers();
    let options = new RequestOptions({headers: headers});
    return this.http.post(this._url("classes/articals"), body, options).map(
      response => { return response.json() || {} }
    ).catch( this.handleError );
  }

  public getArticals(): Observable<any> {
    let options = new RequestOptions({headers: this._headers()});
    return this.http.get(this._url("classes/articals"), options).map(
      response => { return response.json() || {} }
    ).catch( this.handleError );
  }

  public getArtical(objectId: string): Observable<any> {
    let options = new RequestOptions({headers: this._headers()});
    return this.http.get(this._url("classes/articals/"+objectId), options).map(
      response => { return response.json() || {} }
    ).catch( this.handleError );
  }

  public updateArtical(objectId: string, data: {}): Observable<any> {
    let body = JSON.stringify(data);
    let headers = this._headers();
    let options = new RequestOptions({headers: headers});
    return this.http.put(this._url("classes/articals/"+objectId), body, options).map(
      response => { return response.json() || {} }
    ).catch( this.handleError );
  }

  public login(data: {}): Observable<any> {
    let body = JSON.stringify(data);
    let headers = this._headers();
    let options = new RequestOptions({headers: headers});
    return this.http.post(this._url("login"), body, options).map(
      response => { return response.json() || {} }
    ).catch( this.handleError );
  }

  public getMe(): Observable<any> {
    if (!localStorage.getItem("sessionToken")) return Observable.throw("not login");
    let options = new RequestOptions({headers: this._headers()});
    return this.http.get(this._url("users/me"), options).map(
      response => response.json() || {}
    ).catch( this.handleError );
  }

}
