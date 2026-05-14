export interface Ticket {
  idTicket: number;
  codigo: string;
  titulo: string;
  descripcion: string;
  idEstadoTicket: number;
  nombreEstadoTicket: string;
  idPrioridadTicket: number;
  nombrePrioridadTicket: string;
  idSubcategoriaTicket: number;
  nombreSubcategoriaTicket: string;
  idCategoriaTicket: number;
  nombreCategoriaTicket: string;
  idUsuarioSolicitante: string;
  nombreUsuarioSolicitante: string;
  idUsuarioAsignado: string | null;
  nombreUsuarioAsignado: string | null;
  fechaCreacion: string;
  fechaActualizacion: string | null;
  fechaPrimeraRespuesta: string | null;
  fechaResolucion: string | null;
  fechaCierre: string | null;
  cantidadReaperturas: number;
}

export interface TicketSelectOption {
  idTicket: number;
  codigo: string;
  titulo: string;
  descripcion: string | null;
  nombreEstadoTicket: string;
}

export interface CrearTicketRequest {
  titulo: string;
  descripcion: string;
  idPrioridadTicket: number;
  idSubcategoriaTicket: number;
  relaciones: CrearTicketRelacionRequest[];
  archivos: File[];
}

export interface AsignarTicketRequest {
  idUsuarioAsignado: string;
  comentario: string | null;
}

export interface CrearTicketRelacionRequest {
  idTicketRelacionado: number;
  idTipoRelacionTicket: number;
  observacion: string | null;
}

export interface UsuarioSelect {
  id: string;
  nombreCompleto: string;
  email: string | null;
  userName: string | null;
}

export interface TicketFilters {
  idEstadoTicket: number | null;
  idPrioridadTicket: number | null;
  idSubcategoriaTicket: number | null;
  buscar: string | null;
  fechaCreacionDesde: string | null;
  fechaCreacionHasta: string | null;
  fechaActualizacionDesde: string | null;
  fechaActualizacionHasta: string | null;
  fechaPrimeraRespuestaDesde: string | null;
  fechaPrimeraRespuestaHasta: string | null;
  fechaResolucionDesde: string | null;
  fechaResolucionHasta: string | null;
  fechaCierreDesde: string | null;
  fechaCierreHasta: string | null;
}

export interface EstadoTicketOption {
  idEstadoTicket: number;
  nombre: string;
  esEstadoFinal: boolean;
  orden: number;
}

export interface PrioridadTicketOption {
  idPrioridadTicket: number;
  nombre: string;
  nivel: number;
}

export interface CategoriaTicketOption {
  idCategoriaTicket: number;
  nombre: string;
}

export interface SubcategoriaTicketOption {
  idSubcategoriaTicket: number;
  idCategoriaTicket: number;
  nombreCategoriaTicket: string;
  nombre: string;
}

export interface TicketAdjunto {
  idTicketAdjunto: number;
  idTicket: number;
  codigoTicket: string;
  nombreArchivoOriginal: string;
  nombreArchivoGuardado: string;
  rutaArchivo: string;
  tipoContenido: string | null;
  extension: string | null;
  pesoBytes: number | null;
  idUsuarioSubida: string;
  nombreUsuarioSubida: string;
  fechaSubida: string;
  activo: boolean;
}

export interface TicketBitacora {
  idTicketBitacora: number;
  idTicket: number;
  comentario: string;
  esInterno: boolean;
  idUsuarioCreacion: string;
  nombreUsuarioCreacion: string;
  fechaCreacion: string;
  activo: boolean;
}

export interface TicketHistorial {
  idTicketHistorial: number;
  idTicket: number;
  campoModificado: string;
  valorAnterior: string | null;
  valorNuevo: string | null;
  comentario: string | null;
  idUsuarioModificacion: string;
  nombreUsuarioModificacion: string;
  fechaModificacion: string;
}

export interface TicketRelacion {
  idTicketRelacion: number;
  idTicketOrigen: number;
  codigoTicketOrigen: string;
  idTicketRelacionado: number;
  codigoTicketRelacionado: string;
  idTipoRelacionTicket: number;
  nombreTipoRelacionTicket: string;
  observacion: string | null;
  idUsuarioCreacion: string;
  nombreUsuarioCreacion: string;
  fechaCreacion: string;
  activo: boolean;
}

export interface TipoRelacionTicketOption {
  idTipoRelacionTicket: number;
  nombre: string;
  descripcion: string | null;
}

export interface TicketSla {
  idTicketSla: number;
  idTicket: number;
  codigoTicket: string;
  idSlaRegla: number;
  nombreSlaPolitica: string;
  nombrePrioridadTicket: string;
  nombreCategoriaTicket: string | null;
  fechaInicio: string;
  fechaLimitePrimeraRespuesta: string;
  fechaLimiteResolucion: string;
  fechaPrimeraRespuestaReal: string | null;
  fechaResolucionReal: string | null;
  primeraRespuestaVencida: boolean;
  resolucionVencida: boolean;
  activo: boolean;
}

export interface EstadoDisponibleTicket {
  idFlujoEstadoTicket: number;
  idEstadoTicket: number;
  nombre: string;
  descripcion: string | null;
  esEstadoFinal: boolean;
  orden: number;
  requiereComentario: boolean;
}

export interface PaginatedResult<T> {
  pagina: number;
  tamanoPagina: number;
  totalRegistros: number;
  totalPaginas: number;
  datos: T[];
}
