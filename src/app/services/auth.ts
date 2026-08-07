
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

 register(user: any): boolean {

  const users = JSON.parse(localStorage.getItem('users') || '[]');

  const email = user.email.trim().toLowerCase();

  const exists = users.some(
    (u: any) => u.email.trim().toLowerCase() === email
  );

  if (exists) {
    return false;
  }

  users.push({
    ...user,
    email: email
  });

  localStorage.setItem('users', JSON.stringify(users));

  return true;
}
 login(email: string, password: string): boolean {

  const users = JSON.parse(localStorage.getItem('users') || '[]');

  const user = users.find(
    (u: any) =>
      u.email.trim().toLowerCase() === email.trim().toLowerCase() &&
      u.password === password
  );

  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    return true;
  }

  return false;
}

  logout() {
    localStorage.removeItem('currentUser');
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() != null;
  }
}
