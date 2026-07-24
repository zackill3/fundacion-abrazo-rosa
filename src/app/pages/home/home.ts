import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InstitutionalInformationService } from '../../core/services/institutional-information.service';

@Component({ selector: 'app-home', imports: [RouterLink], templateUrl: './home.html', styleUrl: './home.scss' })
export class Home implements OnInit {
  protected readonly information = inject(InstitutionalInformationService);
  protected readonly policyPreview = computed(() => {
    const policy = this.information.dataProcessingPolicy().trim();
    return policy.length > 260 ? `${policy.slice(0, 260).trim()}…` : policy;
  });

  ngOnInit(): void {
    void this.information.load();
  }
}
