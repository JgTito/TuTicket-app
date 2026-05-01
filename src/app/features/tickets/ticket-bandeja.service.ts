import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  CategoriaTicketOption,
  AsignarTicketRequest,
  CrearTicketRequest,
  EstadoTicketOption,
  PaginatedResult,
  PrioridadTicketOption,
  SubcategoriaTicketOption,
  EstadoDisponibleTicket,
  Ticket,
  TicketFilters,
  TicketAdjunto,
  TicketBitacora,
  TicketHistorial,
  TicketRelacion,
  TicketSla,
  UsuarioSelect
} from './ticket-bandeja.models';

@Injectable({
  providedIn: 'root'
})
export class TicketBandejaService {
  private readonly http = inject(HttpClient);
  private readonly ticketUrl = `${environment.apiUrl}/Ticket`;
  private readonly adjuntoUrl = `${environment.apiUrl}/TicketAdjunto`;
  private readonly estadoUrl = `${environment.apiUrl}/EstadoTicket`;
  private readonly categoriaSelectUrl = `${environment.apiUrl}/CategoriaTicket/select`;
  private readonly prioridadSelectUrl = `${environment.apiUrl}/PrioridadTicket/select`;
  private readonly subcategoriaSelectUrl = `${environment.apiUrl}/SubcategoriaTicket/select`;
  private readonly usuarioSelectUrl = `${environment.apiUrl}/Usuario/select`;

  getTickets(pagina: number, tamanoPagina: number, filters?: TicketFilters) {
    let params = new HttpParams()
      .set('pagina', pagina)
      .set('tamanoPagina', tamanoPagina);

    if (filters?.idEstadoTicket) params = params.set('idEstadoTicket', filters.idEstadoTicket);
    if (filters?.idPrioridadTicket) params = params.set('idPrioridadTicket', filters.idPrioridadTicket);
    if (filters?.idSubcategoriaTicket) params = params.set('idSubcategoriaTicket', filters.idSubcategoriaTicket);
    if (filters?.buscar) params = params.set('buscar', filters.buscar);
    if (filters?.fechaCreacionDesde) params = params.set('fechaCreacionDesde', filters.fechaCreacionDesde);
    if (filters?.fechaCreacionHasta) params = params.set('fechaCreacionHasta', filters.fechaCreacionHasta);
    if (filters?.fechaActualizacionDesde) params = params.set('fechaActualizacionDesde', filters.fechaActualizacionDesde);
    if (filters?.fechaActualizacionHasta) params = params.set('fechaActualizacionHasta', filters.fechaActualizacionHasta);
    if (filters?.fechaPrimeraRespuestaDesde) params = params.set('fechaPrimeraRespuestaDesde', filters.fechaPrimeraRespuestaDesde);
    if (filters?.fechaPrimeraRespuestaHasta) params = params.set('fechaPrimeraRespuestaHasta', filters.fechaPrimeraRespuestaHasta);
    if (filters?.fechaResolucionDesde) params = params.set('fechaResolucionDesde', filters.fechaResolucionDesde);
    if (filters?.fechaResolucionHasta) params = params.set('fechaResolucionHasta', filters.fechaResolucionHasta);
    if (filters?.fechaCierreDesde) params = params.set('fechaCierreDesde', filters.fechaCierreDesde);
    if (filters?.fechaCierreHasta) params = params.set('fechaCierreHasta', filters.fechaCierreHasta);

    return this.http.get<PaginatedResult<Ticket>>(this.ticketUrl, { params });
  }

  getTicket(idTicket: number) {
    return this.http.get<Ticket>(`${this.ticketUrl}/${idTicket}`);
  }

  createTicket(request: CrearTicketRequest) {
    const formData = new FormData();
    formData.append('Titulo', request.titulo);
    formData.append('Descripcion', request.descripcion);
    formData.append('IdPrioridadTicket', String(request.idPrioridadTicket));
    formData.append('IdSubcategoriaTicket', String(request.idSubcategoriaTicket));
    request.archivos.forEach((archivo) => formData.append('Archivos', archivo));

    return this.http.post<Ticket>(this.ticketUrl, formData);
  }

  getPrioridadesSelect() {
    const params = new HttpParams().set('incluirInactivos', false);
    return this.http.get<PrioridadTicketOption[]>(this.prioridadSelectUrl, { params });
  }

  getEstadosSelect() {
    const params = new HttpParams()
      .set('incluirInactivos', false)
      .set('pagina', 1)
      .set('tamanoPagina', 100);
    return this.http.get<PaginatedResult<EstadoTicketOption>>(this.estadoUrl, { params });
  }

  getCategoriasSelect() {
    const params = new HttpParams().set('incluirInactivos', false);
    return this.http.get<CategoriaTicketOption[]>(this.categoriaSelectUrl, { params });
  }

  getSubcategoriasSelect(idCategoriaTicket?: number) {
    let params = new HttpParams().set('incluirInactivos', false);

    if (idCategoriaTicket) {
      params = params.set('idCategoriaTicket', idCategoriaTicket);
    }

    return this.http.get<SubcategoriaTicketOption[]>(this.subcategoriaSelectUrl, { params });
  }

  getAdjuntos(idTicket: number, pagina = 1, tamanoPagina = 5) {
    const params = new HttpParams()
      .set('pagina', pagina)
      .set('tamanoPagina', tamanoPagina);
    return this.http.get<PaginatedResult<TicketAdjunto>>(`${this.ticketUrl}/${idTicket}/adjuntos`, { params });
  }

  getBitacora(idTicket: number, pagina = 1, tamanoPagina = 5) {
    const params = new HttpParams()
      .set('pagina', pagina)
      .set('tamanoPagina', tamanoPagina);
    return this.http.get<PaginatedResult<TicketBitacora>>(`${this.ticketUrl}/${idTicket}/bitacora`, { params });
  }

  createBitacora(idTicket: number, request: { comentario: string; esInterno: boolean; idUsuarioCreacion: string }) {
    return this.http.post<TicketBitacora>(`${this.ticketUrl}/${idTicket}/bitacora`, request);
  }

  getHistorial(idTicket: number, pagina = 1, tamanoPagina = 5) {
    const params = new HttpParams()
      .set('pagina', pagina)
      .set('tamanoPagina', tamanoPagina);
    return this.http.get<PaginatedResult<TicketHistorial>>(`${this.ticketUrl}/${idTicket}/historial`, { params });
  }

  getEstadosDisponibles(idTicket: number) {
    return this.http.get<EstadoDisponibleTicket[]>(`${this.ticketUrl}/${idTicket}/estados-disponibles`);
  }

  cambiarEstado(idTicket: number, request: { idEstadoTicket: number; idUsuarioModificacion: string; comentario: string | null }) {
    return this.http.put<void>(`${this.ticketUrl}/${idTicket}/cambiar-estado`, request);
  }

  asignarTicket(idTicket: number, request: AsignarTicketRequest) {
    return this.http.put<void>(`${this.ticketUrl}/${idTicket}/asignar`, request);
  }

  getUsuariosSelect(incluirInactivos = false, buscar?: string) {
    let params = new HttpParams().set('incluirInactivos', incluirInactivos);

    if (buscar?.trim()) {
      params = params.set('buscar', buscar.trim());
    }

    return this.http.get<UsuarioSelect[]>(this.usuarioSelectUrl, { params });
  }

  getRelaciones(idTicket: number, incluirInactivos = false) {
    const params = new HttpParams().set('incluirInactivos', incluirInactivos);
    return this.http.get<TicketRelacion[]>(`${this.ticketUrl}/${idTicket}/relaciones`, { params });
  }

  getSla(idTicket: number, incluirInactivos = false) {
    const params = new HttpParams().set('incluirInactivos', incluirInactivos);
    return this.http.get<TicketSla[]>(`${this.ticketUrl}/${idTicket}/sla`, { params });
  }

  getAdjuntoDownloadUrl(idAdjunto: number) {
    return `${this.adjuntoUrl}/${idAdjunto}/descargar`;
  }

  downloadAdjunto(idAdjunto: number) {
    return this.http.get(`${this.adjuntoUrl}/${idAdjunto}/descargar`, {
      observe: 'response',
      responseType: 'blob'
    });
  }

  uploadAdjuntos(idTicket: number, archivos: File[], idUsuarioSubida: string) {
    const formData = new FormData();
    archivos.forEach((archivo) => formData.append('Archivos', archivo));
    formData.append('IdUsuarioSubida', idUsuarioSubida);

    return this.http.post<TicketAdjunto[]>(`${this.ticketUrl}/${idTicket}/adjuntos`, formData);
  }
}
