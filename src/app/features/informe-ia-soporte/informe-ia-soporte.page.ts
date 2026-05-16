import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { DescargarInformeIaRequest, InformeIaSoporteService } from './informe-ia-soporte.service';

@Component({
  selector: 'app-informe-ia-soporte-page',
  templateUrl: './informe-ia-soporte.page.html'
})
export class InformeIaSoportePage {
  private readonly informeIaSoporteService = inject(InformeIaSoporteService);

  readonly anio = signal(new Date().getFullYear());
  readonly mes = signal(new Date().getMonth() + 1);
  readonly limiteTicketsMuestra = signal(40);
  readonly formato = signal<DescargarInformeIaRequest['formato']>('pdf');
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly meses = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
  ];

  descargar(event?: Event): void {
    event?.preventDefault();

    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (!this.parametrosValidos()) {
      this.errorMessage.set('Revisa el anio, mes y limite de tickets. El limite debe estar entre 1 y 100.');
      return;
    }

    this.loading.set(true);

    this.informeIaSoporteService
      .descargarInformeMensual({
        anio: this.anio(),
        mes: this.mes(),
        limiteTicketsMuestra: this.limiteTicketsMuestra(),
        formato: this.formato()
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => this.descargarBlob(response),
        error: (error: HttpErrorResponse) => this.handleError(error)
      });
  }

  setAnio(event: Event): void {
    this.anio.set(Number((event.target as HTMLInputElement).value));
  }

  setMes(event: Event): void {
    this.mes.set(Number((event.target as HTMLSelectElement).value));
  }

  setLimiteTicketsMuestra(event: Event): void {
    this.limiteTicketsMuestra.set(Number((event.target as HTMLInputElement).value));
  }

  setFormato(event: Event): void {
    this.formato.set((event.target as HTMLSelectElement).value as DescargarInformeIaRequest['formato']);
  }

  private parametrosValidos(): boolean {
    return this.anio() >= 2000 &&
      this.anio() <= 2100 &&
      this.mes() >= 1 &&
      this.mes() <= 12 &&
      this.limiteTicketsMuestra() >= 1 &&
      this.limiteTicketsMuestra() <= 100;
  }

  private descargarBlob(response: HttpResponse<Blob>): void {
    const blob = response.body;

    if (!blob) {
      this.errorMessage.set('La API no devolvio contenido para descargar.');
      return;
    }

    const filename = this.obtenerNombreArchivo(response) ?? this.crearNombreArchivoFallback();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    this.successMessage.set(`Informe ${filename} generado correctamente.`);
  }

  private obtenerNombreArchivo(response: HttpResponse<Blob>): string | null {
    const header = response.headers.get('content-disposition') ?? response.headers.get('Content-Disposition');
    if (!header) return null;

    const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(header);
    if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1].replace(/"/g, ''));

    const filenameMatch = /filename="?([^";]+)"?/i.exec(header);
    return filenameMatch?.[1] ?? null;
  }

  private crearNombreArchivoFallback(): string {
    const extension = this.formato() === 'pdf' ? 'pdf' : this.formato() === 'txt' ? 'txt' : 'md';
    return `informe-soporte-${this.anio()}-${this.mes().toString().padStart(2, '0')}.${extension}`;
  }

  private handleError(error: HttpErrorResponse): void {
    if (error.error instanceof Blob) {
      error.error.text().then((text) => {
        this.errorMessage.set(this.parseProblemDetails(text) ?? this.getErrorMessage(error));
      });
      return;
    }

    this.errorMessage.set(this.getErrorMessage(error));
  }

  private parseProblemDetails(text: string): string | null {
    if (!text.trim()) return null;

    try {
      const problem = JSON.parse(text) as Record<string, unknown>;
      const detail = problem['detail'] ?? problem['Detail'];
      const title = problem['title'] ?? problem['Title'];
      const errors = problem['errors'] ?? problem['Errors'];

      if (errors && typeof errors === 'object') {
        return Object.values(errors as Record<string, unknown>)
          .flatMap((value) => Array.isArray(value) ? value.map(String) : [String(value)])
          .join(' ');
      }

      return detail ? String(detail) : title ? String(title) : null;
    } catch {
      return text;
    }
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) return 'No se pudo conectar con la API.';
    if (error.status === 401 || error.status === 403) return 'Tu sesion no tiene permisos para generar informes IA.';
    if (error.status === 400) return 'La API rechazo los parametros del informe.';
    if (error.status === 502) return 'No fue posible generar el informe IA. Revisa la configuracion del generador en la API.';
    return 'Ocurrio un error al generar el informe IA.';
  }
}
