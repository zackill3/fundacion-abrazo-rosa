import { Component, inject, OnInit } from '@angular/core';
import { InstitutionalInformationService } from '../../core/services/institutional-information.service';

@Component({
  selector: 'app-transparency',
  templateUrl: './transparency.html',
  styleUrl: './transparency.scss',
})
export class Transparency implements OnInit {
  protected readonly information = inject(InstitutionalInformationService);

  ngOnInit(): void {
    void this.information.load();
  }

  protected formattedDate(value: string): string {
    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'long',
      timeZone: 'America/Bogota',
    }).format(new Date(value));
  }
}
