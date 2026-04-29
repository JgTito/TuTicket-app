import { Component, input, output } from '@angular/core';
import { CategoriaEquipoSoporte, EquipoSoporte } from './equipo-soporte.models';

@Component({
  selector: 'app-equipo-soporte-categoria-list',
  templateUrl: './equipo-soporte-categoria-list.component.html'
})
export class EquipoSoporteCategoriaListComponent {
  readonly equipo = input<EquipoSoporte | null>(null);
  readonly categoriasEquipo = input<CategoriaEquipoSoporte[]>([]);
  readonly loading = input(false);
  readonly saving = input(false);
  readonly categoriasLoading = input(false);
  readonly incluirInactivos = input(false);
  readonly pagina = input(1);
  readonly tamanoPagina = input(5);
  readonly totalRegistros = input(0);
  readonly totalPaginas = input(0);

  readonly add = output<void>();
  readonly edit = output<CategoriaEquipoSoporte>();
  readonly delete = output<CategoriaEquipoSoporte>();
  readonly toggleInactivos = output<void>();
  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>();

  readonly pageSizeOptions = [5, 10, 25, 50, 100];

  categoriasEquipoSafe(): CategoriaEquipoSoporte[] {
    return this.categoriasEquipo() ?? [];
  }

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
