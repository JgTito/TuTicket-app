import { Component, input, output } from '@angular/core';
import { SlaPolitica } from './sla-politica.models';

@Component({ selector: 'app-sla-politica-list', templateUrl: './sla-politica-list.component.html' })
export class SlaPoliticaListComponent {
  readonly politicas = input<SlaPolitica[]>([]);
  readonly selectedPoliticaId = input<number | null>(null);
  readonly loading = input(false);
  readonly saving = input(false);
  readonly incluirInactivos = input(false);
  readonly pagina = input(1);
  readonly tamanoPagina = input(5);
  readonly totalRegistros = input(0);
  readonly totalPaginas = input(0);
  readonly selectPolitica = output<SlaPolitica>();
  readonly edit = output<SlaPolitica>();
  readonly delete = output<SlaPolitica>();
  readonly toggleInactivos = output<void>();
  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>();
  readonly pageSizeOptions = [5, 10, 25, 50, 100];
  firstRecord(): number { return this.totalRegistros() === 0 ? 0 : (this.pagina() - 1) * this.tamanoPagina() + 1; }
  lastRecord(): number { return Math.min(this.pagina() * this.tamanoPagina(), this.totalRegistros()); }
  emitPageSizeChange(event: Event): void { this.pageSizeChange.emit(Number((event.target as HTMLSelectElement).value)); }
}
