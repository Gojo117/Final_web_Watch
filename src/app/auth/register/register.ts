import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {

  registerForm: FormGroup;

  successMsg = '';

  errorMsg = '';
  showPassword = false;
showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {

    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });

  }

  onSubmit() {

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    if (
      this.registerForm.value.password !==
      this.registerForm.value.confirmPassword
    ) {

      this.errorMsg = 'Passwords do not match';
      return;

    }

    const success = this.authService.register({

      name: this.registerForm.value.name,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password

    });

 if (success) {

  this.successMsg = 'Registration successful!';
  this.errorMsg = '';

  this.registerForm.reset();

  setTimeout(() => {
    this.router.navigate(['/login']);
  }, 1500);

} else {

  this.successMsg = '';
  this.errorMsg = 'This email is already registered. Please use another email.';

}

  }

  togglePassword() {
  this.showPassword = !this.showPassword;
}

toggleConfirmPassword() {
  this.showConfirmPassword = !this.showConfirmPassword;
}

}