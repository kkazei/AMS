import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import axios from 'axios';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = "http://localhost/BlogAPI/api/";
  private loggedIn: boolean = false;
  private token: string | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('jwt');
      if (token) {
        this.token = token;
        this.loggedIn = true;
      }
    }
  }

  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  login(username: string, password: string): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
    };
  
    return new Observable((observer) => {
      axios
        .post(
          this.apiUrl + 'login',
          {
            email: username,
            password: password,
          },
          { headers }
        )
        .then((res) => {
          if (res.status === 200 && res.data.jwt) {
            const token = res.data.jwt;
            if (isPlatformBrowser(this.platformId)) {
              localStorage.setItem('jwt', token);
            }
            this.token = token;
            this.loggedIn = true;
            observer.next(res.data);
          } else {
            observer.error(new Error('Invalid login response'));
          }
          observer.complete();
        })
        .catch((error) => {
          console.error('Login failed:', error);
          observer.error(error);
        });
    });
  }
  

  logout(): Observable<any> {
  if (isPlatformBrowser(this.platformId)) {
    localStorage.removeItem('jwt');
  }
  this.loggedIn = false;
  this.token = null;

  return new Observable((observer) => {
    axios
      .post(this.apiUrl + 'logout')
      .then((res) => {
        console.log(res.data);
        observer.next(res.data);
        observer.complete();
      })
      .catch((error) => {
        console.error('Logout failed:', error);
        observer.error(error);
      });
  });
}
  getUserProfileFromToken(): any {
    if (this.token) {
      const base64Url = this.token.split('.')[1];
      if (base64Url) {
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const decodedToken = JSON.parse(atob(base64));
        return decodedToken.data;
      } else {
        console.error('Invalid token format');
        return null;
      }
    } else {
      console.error('Token not found');
      return null;
    }
  }

  getToken(): string | null {
    return this.token;
  }


registerData(data: any): Observable<any> {
  const headers = {
    'Content-Type': 'application/JSON'
  };

  return new Observable(observer => {
    axios.post(this.apiUrl + "register", data, { headers })
      .then(res => {
        console.log(res.data);
        observer.next(res.data);
        observer.complete();
      })
      .catch(err => {
        console.log(err);
        observer.error(err);
      });
  });
}

}
