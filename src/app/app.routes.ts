import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { RegisterComponent } from './auth/register/register';
import { Home } from './home/home';
import { Products } from './products/products';
import { About } from './about/about';
import { Contact } from './contact/contact';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, data: { hideNavbar: true } },
  { path: 'register', component: RegisterComponent, data: { hideNavbar: true } },
  { path: 'home', component: Home },
  { path: 'products', component: Products },
  { path: 'about', component: About },
  { path: 'contact', component: Contact },
  { path: '**', redirectTo: 'login' }
];