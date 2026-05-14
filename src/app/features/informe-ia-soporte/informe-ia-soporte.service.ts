import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DescargarInformeIaRequest {
  anio: number;
  mes: number;
  limiteTicketsMuestra: number;
  formato: 'markdown' | 'md' | 'txt';
}

@Injectable({
  providedIn: 'root'
})
export class InformeIaSoporteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/InformeIaSoporte`;

  descargarInformeMensual(request: DescargarInformeIaRequest): Observable<HttpResponse<Blob>> {
    const params = new HttpParams()
      .set('anio', request.anio)
      .set('mes', request.mes)
      .set('limiteTicketsMuestra', request.limiteTicketsMuestra)
      .set('formato', request.formato);

    return this.http.get(`${this.apiUrl}/mensual/descargar`, {
      observe: 'response',
      params,
      responseType: 'blob'
    });
  }
}
