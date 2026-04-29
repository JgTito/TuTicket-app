import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard.page.html'
})
export class DashboardPage {
  readonly authService = inject(AuthService);
}
