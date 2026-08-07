import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('Final-project');
  isMenuOpen = false;
  currentUrl = '';

constructor(private router: Router, private authService: AuthService) {
  this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: any) => {
      this.currentUrl = event.urlAfterRedirects;
    });
}

logout() {
  this.authService.logout();
  this.router.navigate(['/login']);
}

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  get showNavbar(): boolean {
    return !['/login', '/register'].includes(this.currentUrl);
  }
  
}