import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router, NavigationEnd ,ActivatedRouteSnapshot } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth';
import { Footer } from "./footer/footer";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  // Default to hidden so there's no flash of navbar before the first
  // route resolves (important for SSR/prerendered pages on Vercel).
  showNavbar = false;
  isMenuOpen = false;
  isProfileOpen = false;

  userName = 'John Doe';
  userEmail = 'john@example.com';
  userAvatar = 'https://ui-avatars.com/api/?name=John+Doe&background=d4af37&color=fff&size=40';

  wishlistCount = 2;
  notificationCount = 3;

  constructor(private router: Router) {}

  ngOnInit() {
    // Compute immediately from whatever route has already resolved
    // (works for both client nav and SSR/prerender).
    this.applyRouteVisibility(this.router.routerState.snapshot.root);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.applyRouteVisibility(this.router.routerState.snapshot.root);
    });
  }

  /**
   * Walks the resolved route tree (not the raw URL string) and looks
   * for `data.hideNavbar` on any matched route/child route. This avoids
   * the fragile URL string matching that broke on trailing slashes,
   * query params, and Vercel's SSR/prerender redirects.
   */
  private getRouteData(root: ActivatedRouteSnapshot): Record<string, any> {
    let data: Record<string, any> = {};
    let node: ActivatedRouteSnapshot | null = root;
    while (node) {
      data = { ...data, ...node.data };
      node = node.firstChild;
    }
    return data;
  }

  private applyRouteVisibility(root: ActivatedRouteSnapshot) {
    const data = this.getRouteData(root);
    this.showNavbar = !data['hideNavbar'];

    if (!this.showNavbar) {
      this.isMenuOpen = false;
      this.isProfileOpen = false;
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    if (this.isMenuOpen) {
      this.isProfileOpen = false;
    }
  }

  openProfile() {
    if (!this.isMenuOpen && this.showNavbar) {
      this.isProfileOpen = true;
    }
  }

  closeProfile() {
    this.isProfileOpen = false;
  }

  toggleProfile() {
    if (window.innerWidth <= 768 && this.showNavbar) {
      this.isProfileOpen = !this.isProfileOpen;
    }
  }

  handleProfileClick() {
    console.log('My Profile clicked - static');
    this.isProfileOpen = false;
  }

  handleSettingsClick() {
    console.log('Settings clicked - static');
    this.isProfileOpen = false;
  }

  logout() {
    console.log('Logging out...');
    this.router.navigate(['/login']);
    this.isProfileOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const dropdown = document.querySelector('.profile-dropdown');
    if (dropdown && !dropdown.contains(target)) {
      this.isProfileOpen = false;
    }
  }
}