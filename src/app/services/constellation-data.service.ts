import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface ConstellationData {
  name: string | null;
  symbol: string | null;
  myth: string | null;
  mythLong?: string | null;
  imagePath: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ConstellationDataService {

  // private dataUrl = 'assets/data/constellations.json';
  private mythsUrl = 'assets/data/constellation-myths-short.json';
  private mythsLongUrl = 'assets/data/constellation-myths-long.json';
  // private starsUrl = 'assets/data/stars.json';
  // private dsoUrl = 'assets/data/dso.json';
  // private linesUrl = 'assets/data/constellation-lines.json';
  private constellationMyths: { [key: string]: string } | null = null;
  private constellationMythsLong: { [key: string]: string } | null = null;
  private constellationNames: { [key: string]: string } | null = null;
  private mythsLoadedPromise: Promise<void>;
  private mythsLongLoadedPromise: Promise<void>;
  private namesLoadedPromise: Promise<void>;

  // Added URL for the name map
  private namesUrl = 'assets/symbol-name-map.json';

  private initialData: ConstellationData = {
    name: null,
    symbol: null,
    myth: null,
    mythLong: null,
    imagePath: null
  };

  // BehaviorSubject to hold the current constellation data
  private constellationDataSource = new BehaviorSubject<ConstellationData>(this.initialData);

  // Observable stream for components to subscribe to
  currentConstellationData = this.constellationDataSource.asObservable();


  constructor(private http: HttpClient) {
    this.mythsLoadedPromise = this.loadMyths();
    this.mythsLongLoadedPromise = this.loadLongMyths();
    this.namesLoadedPromise = this.loadNames();
  }

  // Method to load short myths from JSON
  private loadMyths(): Promise<void> {
    console.log('Loading short constellation myths...');
    return firstValueFrom(
      this.http.get<{ [key: string]: string }>(this.mythsUrl)
        .pipe(
          tap(myths => {
            this.constellationMyths = myths;
            console.log('Short constellation myths loaded successfully.');
          })
        )
    ).then(() => { }).catch(error => {
      console.error('Failed to load short constellation myths:', error);
      this.constellationMyths = {};
    });
  }

  // Method to load long myths from JSON
  private loadLongMyths(): Promise<void> {
    console.log('Loading long constellation myths...');
    return firstValueFrom(
      this.http.get<{ [key: string]: string }>(this.mythsLongUrl)
        .pipe(
          tap(myths => {
            this.constellationMythsLong = myths;
            console.log('Long constellation myths loaded successfully.');
          })
        )
    ).then(() => { }).catch(error => {
      console.error('Failed to load long constellation myths:', error);
      this.constellationMythsLong = {};
    });
  }

  // Added: Method to load names from JSON
  private loadNames(): Promise<void> {
    console.log('Loading constellation names map...');
    return firstValueFrom(
      this.http.get<{ [key: string]: string }>(this.namesUrl)
        .pipe(
          tap(names => {
            this.constellationNames = names;
            console.log('Constellation names map loaded successfully.');
          })
        )
    ).then(() => { }).catch(error => {
      console.error('Failed to load constellation names map:', error);
      this.constellationNames = {}; // Initialize as empty on error
    });
  }

  // Method to get all available constellation symbols (asynchronous)
  async getConstellationSymbols(): Promise<string[]> {
    await this.mythsLoadedPromise;
    // Return sorted symbols (keys) from the loaded myths
    return this.constellationMyths ? Object.keys(this.constellationMyths).sort() : [];
  }

  // Added: Method to get all available constellations with names and symbols
  async getConstellationList(): Promise<Array<{ symbol: string, name: string }>> {
    // Wait for both myths (to know which symbols are valid) and names to load
    await Promise.all([this.mythsLoadedPromise, this.namesLoadedPromise]);

    console.log('*** Constellation names:', this.constellationNames);


    if (!this.constellationMyths || !this.constellationNames) {
      console.warn('Myths or names not loaded, returning empty list.');
      return [];
    }

    const availableSymbols = Object.keys(this.constellationMyths);
    const list = availableSymbols.map(symbol => ({
      symbol: symbol,
      // Get name from map, fallback to symbol if not found
      name: this.constellationNames![symbol.toUpperCase()] || symbol
    }));

    // Sort by full name
    list.sort((a, b) => a.name.localeCompare(b.name));

    // --- DEBUGGING: Log the generated list ---
    console.log('[Service] getConstellationList returning:', JSON.stringify(list.slice(0, 5)) + '...'); // Log first few entries
    // --- END DEBUGGING ---

    return list;
  }

  // Added: Method to get a constellation's full name by symbol
  async getConstellationName(symbol: string): Promise<string> {
    await this.namesLoadedPromise;
    const upperSymbol = symbol.toUpperCase();
    if (this.constellationNames && this.constellationNames[upperSymbol]) {
      const name = this.constellationNames[upperSymbol];
      console.log(`[Service] getConstellationName: Found name '${name}' for symbol '${symbol}'`);
      return name;
    } else {
      console.warn(`[Service] getConstellationName: Name not found for symbol: ${symbol} (searched as ${upperSymbol}). Falling back to symbol.`);
      return symbol; // Fallback to symbol itself
    }
  }

  // Method to get a short myth by symbol (asynchronous)
  async getMyth(symbol: string): Promise<string> {
    await this.mythsLoadedPromise;

    const upperCaseSymbol = symbol.toUpperCase();

    if (this.constellationMyths && this.constellationMyths[upperCaseSymbol]) {
      return this.constellationMyths[upperCaseSymbol];
    } else {
      console.warn(`Short myth not found for symbol: ${symbol} (searched as ${upperCaseSymbol})`);
      return `No short myth found for ${symbol}.`;
    }
  }

  // Method to get a long myth by symbol (asynchronous)
  async getMythLong(symbol: string): Promise<string> {
    await this.mythsLongLoadedPromise;

    const upperCaseSymbol = symbol.toUpperCase();

    if (this.constellationMythsLong && this.constellationMythsLong[upperCaseSymbol]) {
      return this.constellationMythsLong[upperCaseSymbol];
    } else {
      console.warn(`Long myth not found for symbol: ${symbol} (searched as ${upperCaseSymbol})`);
      return `No long myth found for ${symbol}.`;
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
