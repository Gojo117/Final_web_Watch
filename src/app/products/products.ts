import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product, ProductService } from '../services/product';
import { environment } from '../../environments/environment';

// =========================================================
// TOAST TYPES
// =========================================================

type ToastType = 'success' | 'error';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products implements OnInit {

  // =========================================================
  // DATA
  // =========================================================

  products: Product[] = [];
  filteredProducts: Product[] = [];
  pagedProducts: Product[] = [];

  imageBaseUrl = environment.apiUrl;

  // =========================================================
  // SEARCH & FILTER
  // =========================================================

  searchTerm = '';
  stockFilter: 'all' | 'in' | 'out' = 'all';

  // =========================================================
  // PAGINATION
  // =========================================================

  currentPage = 1;
  pageSize = 5;
  totalPages = 1;

  // =========================================================
  // CREATE / UPDATE FORM
  // =========================================================

  showForm = false;
  isEditMode = false;
  editingProductId: number | null = null;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isSubmitting = false;

  formModel = {
    name: '',
    stock: 0,
    price: 0,
    description: ''
  };

  // =========================================================
  // DELETE
  // =========================================================

  deleteTargetId: number | null = null;
  isDeleting = false;

  // =========================================================
  // TOASTS
  // =========================================================

  toasts: Toast[] = [];
  private toastIdCounter = 0;

  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

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
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.showToast('Failed to load products. Please refresh the page.', 'error');
      }
    });
  }

  // =========================================================
  // SEARCH + FILTER
  // =========================================================

  applyFilters(): void {
    let result = [...this.products];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.trim().toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term)
      );
    }

    if (this.stockFilter === 'in') {
      result = result.filter(p => p.stock > 0);
    } else if (this.stockFilter === 'out') {
      result = result.filter(p => p.stock === 0);
    }

    this.filteredProducts = result;
    this.currentPage = 1;
    this.updatePagination();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.stockFilter = 'all';
    this.applyFilters();
  }

  // =========================================================
  // PAGINATION
  // =========================================================

  updatePagination(): void {
    this.totalPages = Math.max(1, Math.ceil(this.filteredProducts.length / this.pageSize));

    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedProducts = this.filteredProducts.slice(start, start + this.pageSize);
  }

  goToPage(page: number | string): void {
    if (typeof page !== 'number') return;
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  prevPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  get pageNumbers(): (number | string)[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const pages: (number | string)[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
      return pages;
    }

    pages.push(1);

    if (current > 3) {
      pages.push('...');
    }

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (current < total - 2) {
      pages.push('...');
    }

    pages.push(total);
    return pages;
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.updatePagination();
  }

  // =========================================================
  // CREATE
  // =========================================================

  openCreateForm(): void {
    this.isEditMode = false;
    this.editingProductId = null;
    this.formModel = {
      name: '',
      stock: 0,
      price: 0,
      description: ''
    };
    this.selectedFile = null;
    this.imagePreview = null;
    this.isSubmitting = false;
    this.showForm = true;
    this.cdr.detectChanges();
  }

  // =========================================================
  // UPDATE
  // =========================================================

  openEditForm(product: Product): void {
    this.isEditMode = true;
    this.editingProductId = product.id;
    this.formModel = {
      name: product.name,
      stock: product.stock,
      price: product.price,
      description: product.description || ''
    };
    this.selectedFile = null;
    this.imagePreview = product.imageUrl ? this.imageBaseUrl + product.imageUrl : null;
    this.isSubmitting = false;
    this.showForm = true;
    this.cdr.detectChanges();
  }

  // =========================================================
  // CLOSE FORM
  // =========================================================

  closeForm(): void {
    if (this.isSubmitting || !this.showForm) {
      return;
    }
    this.showForm = false;
    this.cdr.detectChanges();
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeForm();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.showForm) {
      this.closeForm();
      return;
    }
    if (this.deleteTargetId !== null) {
      this.cancelDelete();
    }
  }

  // =========================================================
  // FILE SELECT
  // =========================================================

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  // =========================================================
  // CREATE / UPDATE
  // =========================================================

  submitForm(): void {
    if (this.isSubmitting) {
      return;
    }

    if (!this.formModel.name.trim()) {
      this.showToast('Product name is required.', 'error');
      return;
    }

    this.isSubmitting = true;
    this.cdr.detectChanges();

    const formData = new FormData();
    formData.append('name', this.formModel.name.trim());
    formData.append('stock', String(this.formModel.stock));
    formData.append('price', String(this.formModel.price));
    formData.append('description', this.formModel.description || '');

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    if (this.isEditMode && this.editingProductId !== null) {
      this.productService.updateProduct(this.editingProductId, formData).subscribe({
        next: (response) => {
          this.showToast('Product updated successfully.', 'success');
          this.showForm = false;
          this.isSubmitting = false;
          this.resetForm();
          this.cdr.detectChanges();
          this.loadProducts();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
          this.showToast('Failed to update product: ' + (err.message || 'Please try again.'), 'error');
        }
      });
      return;
    }

    this.productService.createProduct(formData).subscribe({
      next: (response) => {
        this.showToast('Product added successfully.', 'success');
        this.showForm = false;
        this.isSubmitting = false;
        this.resetForm();
        this.cdr.detectChanges();
        this.loadProducts();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
        this.showToast('Failed to add product: ' + (err.message || 'Please try again.'), 'error');
      }
    });
  }

  // =========================================================
  // RESET FORM
  // =========================================================

  private resetForm(): void {
    this.isEditMode = false;
    this.editingProductId = null;
    this.formModel = {
      name: '',
      stock: 0,
      price: 0,
      description: ''
    };
    this.selectedFile = null;
    this.imagePreview = null;
  }

  // =========================================================
  // DELETE CONFIRM
  // =========================================================

  confirmDelete(id: number): void {
    if (this.isDeleting) {
      return;
    }
    this.deleteTargetId = id;
    this.cdr.detectChanges();
  }

  cancelDelete(): void {
    if (this.isDeleting || this.deleteTargetId === null) {
      return;
    }
    this.deleteTargetId = null;
    this.cdr.detectChanges();
  }

  onDeleteOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cancelDelete();
    }
  }

  // =========================================================
  // DELETE
  // =========================================================

  deleteProduct(): void {
    if (this.deleteTargetId === null) {
      return;
    }

    if (this.isDeleting) {
      return;
    }

    this.isDeleting = true;
    this.cdr.detectChanges();

    const id = this.deleteTargetId;

    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.showToast('Product deleted successfully.', 'success');
        this.deleteTargetId = null;
        this.isDeleting = false;
        this.cdr.detectChanges();
        this.loadProducts();
      },
      error: (err) => {
        this.isDeleting = false;
        this.cdr.detectChanges();
        this.showToast('Failed to delete product: ' + (err.message || 'Please try again.'), 'error');
      }
    });
  }

  // =========================================================
  // STATISTICS
  // =========================================================

  getInStockCount(): number {
    return this.filteredProducts.filter(p => p.stock > 0).length;
  }

  getOutOfStockCount(): number {
    return this.filteredProducts.filter(p => p.stock === 0).length;
  }

  // =========================================================
  // TOAST NOTIFICATIONS
  // =========================================================

  showToast(message: string, type: ToastType = 'success'): void {
    const id = ++this.toastIdCounter;
    this.toasts.push({ id, type, message });
    this.cdr.detectChanges();

    setTimeout(() => {
      this.dismissToast(id);
      this.cdr.detectChanges();
    }, 3500);
  }

  dismissToast(id: number): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.cdr.detectChanges();
  }

  Math = Math;
}