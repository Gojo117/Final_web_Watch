import { Component, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router, NavigationEnd } from '@angular/router';
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
  showNavbar = true;
  isMenuOpen = false;
  isProfileOpen = false;
  
  // User data - static (not changing)
  userName = 'John Doe';
  userEmail = 'john@example.com';
  userAvatar = 'https://ui-avatars.com/api/?name=John+Doe&background=d4af37&color=fff&size=40';

  wishlistCount = 2;
  notificationCount = 3; // Static notification count

  constructor(private router: Router) {}

  ngOnInit() {
    // Check initial route
    this.checkRoute(this.router.url);
    
    // Subscribe to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.checkRoute(event.url);
    });
  }

  checkRoute(url: string) {
    // Hide navbar and footer on login and register pages
    const hideNavRoutes = ['/login', '/register'];
    this.showNavbar = !hideNavRoutes.includes(url);
    
    // If on login or register, ensure menu is closed
    if (!this.showNavbar) {
      this.isMenuOpen = false;
      this.isProfileOpen = false;
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    // Close profile dropdown when menu toggles on mobile
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

  // Toggle profile for click on mobile
  toggleProfile() {
    if (window.innerWidth <= 768 && this.showNavbar) {
      this.isProfileOpen = !this.isProfileOpen;
    }
  }

  // Static handlers - do nothing
  handleProfileClick() {
    // Do nothing - static
    console.log('My Profile clicked - static');
    this.isProfileOpen = false; // Close dropdown
  }

  handleSettingsClick() {
    // Do nothing - static
    console.log('Settings clicked - static');
    this.isProfileOpen = false; // Close dropdown
  }

  logout() {
    // Implement logout logic
    console.log('Logging out...');
    // Navigate to login
    this.router.navigate(['/login']);
    // Close profile dropdown
    this.isProfileOpen = false;
  }

  // Close dropdowns on outside click
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const dropdown = document.querySelector('.profile-dropdown');
    if (dropdown && !dropdown.contains(target)) {
      this.isProfileOpen = false;
    }
  }
}