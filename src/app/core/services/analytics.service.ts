import { Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

export interface AnalyticsData { visits: number; pageViews: number; clicks: number; pages: Record<string, number>; }

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  readonly data = signal<AnalyticsData>(this.read());

  constructor(router: Router) {
    if (!sessionStorage.getItem('abrazo-visit')) {
      sessionStorage.setItem('abrazo-visit', '1');
      this.update(current => ({ ...current, visits: current.visits + 1 }));
    }
    router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe(event => {
      const path = event.urlAfterRedirects.split('?')[0].split('#')[0];
      if (path.startsWith('/admin') || path === '/login') return;
      this.update(current => ({ ...current, pageViews: current.pageViews + 1, pages: { ...current.pages, [path]: (current.pages[path] ?? 0) + 1 } }));
    });
    document.addEventListener('click', event => {
      const target = event.target as HTMLElement | null;
      if (location.pathname.startsWith('/admin') || !target?.closest('a, button')) return;
      this.update(current => ({ ...current, clicks: current.clicks + 1 }));
    });
  }

  reset(): void { const empty = { visits: 0, pageViews: 0, clicks: 0, pages: {} }; localStorage.setItem('abrazo-analytics', JSON.stringify(empty)); this.data.set(empty); }
  private update(change: (data: AnalyticsData) => AnalyticsData): void { const next = change(this.data()); localStorage.setItem('abrazo-analytics', JSON.stringify(next)); this.data.set(next); }
  private read(): AnalyticsData { try { return JSON.parse(localStorage.getItem('abrazo-analytics') ?? '') as AnalyticsData; } catch { return { visits: 0, pageViews: 0, clicks: 0, pages: {} }; } }
}
