import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product, ProductService } from '../services/product';
import { environment } from '../../environments/environment'; 

type HomeTab = 'best-sellers' | 'new-in' | 'sale';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {

  // =========================================================
  // DATA
  // =========================================================

  allProducts: Product[] = [];
  displayedProducts: Product[] = [];

  activeTab: HomeTab = 'best-sellers';
  isLoading = true;


  imageBaseUrl = environment.apiUrl;

  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(private productService: ProductService) {}

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    this.loadProducts();
  }

  // =========================================================
  // LOAD PRODUCTS
  // =========================================================

  loadProducts(): void {
    this.isLoading = true;

    this.productService.getProducts().subscribe({
      next: (data) => {
        this.allProducts = data;
        this.applyTab();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.isLoading = false;
      }
    });
  }

  // =========================================================
  // TAB SWITCHING
  // =========================================================

  setTab(tab: HomeTab): void {
    if (this.activeTab === tab) return;
    this.activeTab = tab;
    this.applyTab();
  }

  private applyTab(): void {
    switch (this.activeTab) {

      case 'best-sellers':
        // TODO: replace with real "best seller" ranking (e.g. sales count)
        // once that data is available from the API. For now: first 4.
        this.displayedProducts = this.allProducts.slice(0, 4);
        break;

      case 'new-in':
        // Assumes higher `id` = more recently added.
        // Swap `p.id` for `p.createdAt` (or similar) once that field exists.
        this.displayedProducts = [...this.allProducts]
          .sort((a: any, b: any) => (b.id ?? 0) - (a.id ?? 0))
          .slice(0, 4);
        break;

      case 'sale':
        // Assumes an OPTIONAL `discountPrice` field on Product.
        // Safely returns an empty list if that field doesn't exist yet
        // instead of crashing.
        this.displayedProducts = this.allProducts
          .filter((p: any) => p.discountPrice != null && p.discountPrice < p.price)
          .slice(0, 4);
        break;
    }
  }

  // =========================================================
  // HELPERS (used in template to safely read optional fields)
  // =========================================================

  getDiscountPrice(product: any): number | null {
    return product?.discountPrice ?? null;
  }
}