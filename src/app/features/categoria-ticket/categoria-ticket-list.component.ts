import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { CategoriaTicket } from './categoria-ticket.models';

@Component({
  selector: 'app-categoria-ticket-list',
  imports: [DatePipe],
  templateUrl: './categoria-ticket-list.component.html'
})
export class CategoriaTicketListComponent {
  readonly categorias = input.required<CategoriaTicket[]>();
  readonly loading = input(false);
  readonly saving = input(false);
  readonly pagina = input(1);
  readonly tamanoPagina = input(5);
  readonly totalRegistros = input(0);
  readonly totalPaginas = input(0);

  readonly edit = output<CategoriaTicket>();
  readonly delete = output<CategoriaTicket>();
  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>();

  readonly pageSizeOptions = [5, 10, 25, 50, 100];

  firstRecord(): number {
    if (this.totalRegistros() === 0) {
      return 0;
    }

    return (this.pagina() - 1) * this.tamanoPagina() + 1;
  }

  lastRecord(): number {
    return Math.min(this.pagina() * this.tamanoPagina(), this.totalRegistros());
  }

  previousPage(): void {
    this.pageChange.emit(this.pagina() - 1);
  }

  nextPage(): void {
    this.pageChange.emit(this.pagina() + 1);
  }

  emitPageSizeChange(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    this.pageSizeChange.emit(value);
  }
}
