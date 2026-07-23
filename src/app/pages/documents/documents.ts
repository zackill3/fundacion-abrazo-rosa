import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DocumentsService, PublicDocument } from '../../core/services/documents.service';

@Component({ selector: 'app-documents', imports: [FormsModule], templateUrl: './documents.html', styleUrl: './documents.scss' })
export class Documents {
  private readonly store = inject(DocumentsService);
  private readonly sanitizer = inject(DomSanitizer);
  protected readonly query = signal('');
  protected readonly category = signal('Todas');
  protected readonly year = signal('Todos');
  protected readonly month = signal('Todos');
  protected readonly appliedQuery = signal('');
  protected readonly appliedCategory = signal('Todas');
  protected readonly appliedYear = signal('Todos');
  protected readonly appliedMonth = signal('Todos');
  protected readonly documents = this.store.publicDocuments;
  protected readonly monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  protected readonly availableYears = computed(() => [...new Set(this.documents().map(document => Number(document.documentDate.split('-')[0])))].filter(Boolean).sort((a, b) => b - a));
  protected readonly visible = computed(() => {
    const term = this.appliedQuery().trim().toLowerCase();
    return this.documents().filter(document => {
      const [documentYear, documentMonth] = document.documentDate.split('-').map(Number);
      return (this.appliedCategory() === 'Todas' || document.category === this.appliedCategory()) &&
        (this.appliedYear() === 'Todos' || documentYear === Number(this.appliedYear())) &&
        (this.appliedMonth() === 'Todos' || documentMonth === Number(this.appliedMonth())) &&
        (!term || `${document.title} ${document.description} ${document.category}`.toLowerCase().includes(term));
    });
  });
  protected readonly years = computed(() => new Set(this.documents().map(document => document.documentDate.split('-')[0])).size);
  protected readonly selectedDocument = signal<PublicDocument | null>(null);
  protected readonly viewerUrl = computed<SafeResourceUrl | null>(() => {
    const document = this.selectedDocument();
    return document ? this.sanitizer.bypassSecurityTrustResourceUrl(document.url) : null;
  });

  protected openViewer(document: PublicDocument): void { this.selectedDocument.set(document); }
  protected closeViewer(): void { this.selectedDocument.set(null); }
  protected applyFilters(): void { this.appliedQuery.set(this.query()); this.appliedCategory.set(this.category()); this.appliedYear.set(String(this.year())); this.appliedMonth.set(String(this.month())); }
  protected clearFilters(): void { this.query.set(''); this.category.set('Todas'); this.year.set('Todos'); this.month.set('Todos'); this.applyFilters(); }
  protected formatDocumentDate(value: string): string { const [year, month, day] = value.split('-').map(Number); return `${day} de ${this.monthNames[month - 1].toLowerCase()} de ${year}`; }
}
