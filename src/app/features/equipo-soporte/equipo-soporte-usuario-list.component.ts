import { Component, input, output } from '@angular/core';
import { EquipoSoporte, EquipoSoporteUsuario } from './equipo-soporte.models';

@Component({
  selector: 'app-equipo-soporte-usuario-list',
  templateUrl: './equipo-soporte-usuario-list.component.html'
})
export class EquipoSoporteUsuarioListComponent {
  readonly equipo = input<EquipoSoporte | null>(null);
  readonly integrantes = input<EquipoSoporteUsuario[]>([]);
  readonly loading = input(false);
  readonly saving = input(false);
  readonly usuariosLoading = input(false);
  readonly incluirInactivos = input(false);
  readonly pagina = input(1);
  readonly tamanoPagina = input(5);
  readonly totalRegistros = input(0);
  readonly totalPaginas = input(0);

  readonly add = output<void>();
  readonly edit = output<EquipoSoporteUsuario>();
  readonly delete = output<EquipoSoporteUsuario>();
  readonly toggleInactivos = output<void>();
  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>();

  readonly pageSizeOptions = [5, 10, 25, 50, 100];

  integrantesSafe(): EquipoSoporteUsuario[] {
    return this.integrantes() ?? [];
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
