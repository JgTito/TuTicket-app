import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.page.html'
})
export class RegisterPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.formBuilder.nonNullable.group({
    nombreCompleto: ['', [Validators.required, Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(256)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmarPassword: ['', [Validators.required]]
  });

  passwordsDoNotMatch(): boolean {
    const { password, confirmarPassword } = this.form.getRawValue();
    return this.form.controls.confirmarPassword.touched && password !== confirmarPassword;
  }

  submit(): void {
    this.errorMessage.set(null);

    if (this.form.invalid || this.form.value.password !== this.form.value.confirmarPassword) {
      this.form.markAllAsTouched();
      return;
    }

    const { nombreCompleto, email, password } = this.form.getRawValue();

    this.loading.set(true);
    this.authService.register({ nombreCompleto, email, password }).subscribe({
      next: () => void this.router.navigateByUrl('/app'),
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.getErrorMessage(error));
        this.loading.set(false);
      },
      complete: () => this.loading.set(false)
    });
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'No se pudo conectar con la API. Revisa que esté activa en https://localhost:7113.';
    }

    if (error.status === 400) {
      return 'No se pudo crear la cuenta. Revisa los datos ingresados o si el email ya existe.';
    }

    return 'No fue posible registrar la cuenta. Intenta nuevamente.';
  }
}
