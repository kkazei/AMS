import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import axios from 'axios';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = "http://localhost/amsAPI/api/";
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
      'Content-Type': 'application/json'
    };

    return new Observable((observer) => {
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

  sendMail(data: any): Observable<any> {
    const headers = {
      'Content-Type': 'application/json'
    };

    return new Observable((observer) => {
      axios.post(`${this.apiUrl}mail`, data, { headers })
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

  schedMail(data: any): Observable<any> {
    const headers = {
      'Content-Type': 'application/json'
    };

    return new Observable((observer) => {
      axios.post(`${this.apiUrl}schedule`, data, { headers })
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

  submitMailHistory(data: any): Observable<any> {
    const headers = {
      'Content-Type': 'application/json'
    };

    return new Observable((observer) => {
      axios.post(this.apiUrl + "mailhistory", data, { headers })
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

  createAnnouncement(data: FormData): Observable<any> {
    return new Observable((observer) => {
      axios.post(this.apiUrl + 'announcement', data)
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

  createApartment(data: any): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
    };

    return new Observable((observer) => {
      axios
        .post(this.apiUrl + 'apartment', data, { headers })
        .then((res) => {
          console.log(res.data);
          observer.next(res.data);  // Send the response data to subscribers
          observer.complete();  // Mark the observable as complete
        })
        .catch((err) => {
          console.log(err);
          observer.error(err);  // Notify observers of the error
        });
    });
  }

  getPosts(): Observable<any> {
    return new Observable((observer) => {
      axios
        .get(this.apiUrl + 'getPosts')
        .then((res) => {
          console.log(res.data);
          observer.next(res.data);  // Send the response data to subscribers
          observer.complete();  // Mark the observable as complete
        })
        .catch((err) => {
          console.log(err);
          observer.error(err);  // Notify observers of the error
        });
    });
  }

  getApartments(): Observable<any> {
    return new Observable((observer) => {
      axios
        .get(this.apiUrl + 'getApartments')
        .then((res) => {
          console.log(res.data);
          observer.next(res.data);  // Send the response data to subscribers
          observer.complete();  // Mark the observable as complete
        })
        .catch((err) => {
          console.log(err);
          observer.error(err);  // Notify observers of the error
        });
    });
  }

  assignTenantToApartment(data: any): Observable<any> {
    const headers = {
      'Content-Type': 'application/json'
    };

    return new Observable((observer) => {
      axios
        .post(this.apiUrl + 'assignTenant', data, { headers })
        .then((res) => {
          console.log(res.data);
          observer.next(res.data);  // Send the response data to subscribers
          observer.complete();  // Mark the observable as complete
        })
        .catch((err) => {
          console.log(err);
          observer.error(err);  // Notify observers of the error
        });
    });
  }

  getTenants(): Observable<any> {
    return new Observable((observer) => {
      axios
        .get(this.apiUrl + 'getTenants')
        .then((res) => {
          console.log(res.data);
          observer.next(res.data);  // Send the response data to subscribers
          observer.complete();  // Mark the observable as complete
        })
        .catch((err) => {
          console.log(err);
          observer.error(err);  // Notify observers of the error
        });
    });
  }

  updateApartmentAndTenant(data: any): Observable<any> {
    const headers = {
      'Content-Type': 'application/json'
    };

    return new Observable((observer) => {
      axios
        .put(this.apiUrl + 'updateApartment', data, { headers })
        .then((res) => {
          console.log(res.data);
          observer.next(res.data);  // Send the response data to subscribers
          observer.complete();  // Mark the observable as complete
        })
        .catch((err) => {
          console.log(err);
          observer.error(err);  // Notify observers of the error
        });
    });
  }

}