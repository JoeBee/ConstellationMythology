import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface ConstellationData {
  name: string | null;
  symbol: string | null;
  myth: string | null;
  imagePath: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ConstellationDataService {

  private mythsUrl = 'assets/data/constellation-myths.json';
  private constellationMyths: { [key: string]: string } | null = null;
  private mythsLoadedPromise: Promise<void>;

  private initialData: ConstellationData = {
    name: null,
    symbol: null,
    myth: null,
    imagePath: null
  };

  // BehaviorSubject to hold the current constellation data
  private constellationDataSource = new BehaviorSubject<ConstellationData>(this.initialData);

  // Observable stream for components to subscribe to
  currentConstellationData = this.constellationDataSource.asObservable();

  constructor(private http: HttpClient) {
    this.mythsLoadedPromise = this.loadMyths();
  }

  // Method to load myths from JSON
  private loadMyths(): Promise<void> {
    console.log('Loading constellation myths...');
    return firstValueFrom(
      this.http.get<{ [key: string]: string }>(this.mythsUrl)
        .pipe(
          tap(myths => {
            this.constellationMyths = myths;
            console.log('Constellation myths loaded successfully.');
          })
        )
    ).then(() => { }).catch(error => {
      console.error('Failed to load constellation myths:', error);
      this.constellationMyths = {};
    });
  }

  // Method to get a myth by symbol (asynchronous)
  async getMyth(symbol: string): Promise<string> {
    await this.mythsLoadedPromise;

    const upperCaseSymbol = symbol.toUpperCase();

    if (this.constellationMyths && this.constellationMyths[upperCaseSymbol]) {
      return this.constellationMyths[upperCaseSymbol];
    } else {
      console.warn(`Myth not found for symbol: ${symbol} (searched as ${upperCaseSymbol})`);
      return `No myth found for ${symbol}.`;
    }
  }

  // Method to update the constellation data
  updateConstellationData(data: ConstellationData) {
    this.constellationDataSource.next(data);
  }

  // Method to get the current value (useful if needed synchronously, though observable is preferred)
  getCurrentData(): ConstellationData {
    return this.constellationDataSource.getValue();
  }

  // Method to clear the data
  clearData() {
    this.constellationDataSource.next(this.initialData);
  }
}
