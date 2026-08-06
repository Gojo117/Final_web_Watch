import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { RegisterComponent } from './auth/register/register';
import { Home } from './home/home';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: Home },
  { path: '**', redirectTo: 'login' },
];
