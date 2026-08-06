import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html'
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMsg = '';

  // Static test credentials
  private readonly STATIC_EMAIL = 'test@example.com';
  private readonly STATIC_PASSWORD = '123456';

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.value;

    if (email === this.STATIC_EMAIL && password === this.STATIC_PASSWORD) {
      this.errorMsg = '';
      this.router.navigate(['/home']);
    } else {
      this.errorMsg = 'Invalid email or password';
    }
  }
}