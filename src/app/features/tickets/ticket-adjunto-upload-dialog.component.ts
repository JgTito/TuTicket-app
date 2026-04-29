import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface TicketAdjuntoUploadDialogData {
  codigoTicket: string;
}

@Component({
  selector: 'app-ticket-adjunto-upload-dialog',
  templateUrl: './ticket-adjunto-upload-dialog.component.html'
})
export class TicketAdjuntoUploadDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<TicketAdjuntoUploadDialogComponent, File[]>);
  readonly data = inject<TicketAdjuntoUploadDialogData>(MAT_DIALOG_DATA);
  readonly selectedFiles = signal<File[]>([]);
  readonly errorMessage = signal<string | null>(null);
  readonly maxFileSize = 25_000_000;

  selectFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    this.errorMessage.set(null);

    if (files.length === 0) {
      this.selectedFiles.set([]);
      return;
    }

    const emptyFile = files.find((file) => file.size === 0);
    if (emptyFile) {
      this.selectedFiles.set([]);
      this.errorMessage.set(`El archivo "${emptyFile.name}" esta vacio.`);
      return;
    }

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > this.maxFileSize) {
      this.selectedFiles.set([]);
      this.errorMessage.set('La carga completa supera el limite de 25 MB.');
      return;
    }

    this.selectedFiles.set(files);
  }

  close(): void {
    this.dialogRef.close();
  }

  submit(): void {
    const files = this.selectedFiles();

    if (files.length === 0) {
      this.errorMessage.set('Selecciona al menos un archivo para adjuntar.');
      return;
    }

    this.dialogRef.close(files);
  }
}
