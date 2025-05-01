import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface AstrologyData {
    name: string | null;
    symbol: string | null;
    myth: string | null;
    mythLong?: string | null;
    imagePath: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class AstrologyDataService {

    // private dataUrl = 'assets/data/astrologys.json';
    private mythsUrl = 'assets/data/astrology-short.json';
    private mythsLongUrl = 'assets/data/astrology-long.json';
    // private starsUrl = 'assets/data/stars.json';
    // private dsoUrl = 'assets/data/dso.json';
    // private linesUrl = 'assets/data/astrology-lines.json';
    private astrologyMyths: { [key: string]: string } | null = null;
    private astrologyMythsLong: { [key: string]: string } | null = null;
    private astrologyLoadedPromise: Promise<void>;
    private astrologyLongLoadedPromise: Promise<void>;

    private initialData: AstrologyData = {
        name: null,
        symbol: null,
        myth: null,
        mythLong: null,
        imagePath: null
    };

    // BehaviorSubject to hold the current Astrology data
    private astrologyDataSource = new BehaviorSubject<AstrologyData>(this.initialData);

    // Observable stream for components to subscribe to
    currentAstrologyData = this.astrologyDataSource.asObservable();

    constructor(private http: HttpClient) {
        this.astrologyLoadedPromise = this.loadMyths();
        this.astrologyLongLoadedPromise = this.loadLongMyths();
    }

    // Method to load short myths from JSON
    private loadMyths(): Promise<void> {
        console.log('Loading short astrology myths...');
        return firstValueFrom(
            this.http.get<{ [key: string]: string }>(this.mythsUrl)
                .pipe(
                    tap(myths => {
                        this.astrologyMyths = myths;
                        console.log('Short astrology myths loaded successfully.');
                    })
                )
        ).then(() => { }).catch(error => {
            console.error('Failed to load short astrology myths:', error);
            this.astrologyMyths = {};
        });
    }

    // Method to load long myths from JSON
    private loadLongMyths(): Promise<void> {
        console.log('Loading long astrology myths...');
        return firstValueFrom(
            this.http.get<{ [key: string]: string }>(this.mythsLongUrl)
                .pipe(
                    tap(myths => {
                        this.astrologyMythsLong = myths;
                        console.log('Long astrology myths loaded successfully.');
                    })
                )
        ).then(() => { }).catch(error => {
            console.error('Failed to load long astrology myths:', error);
            this.astrologyMythsLong = {};
        });
    }

    // Method to get a short myth by symbol (asynchronous)
    async getMyth(symbol: string): Promise<string> {
        await this.astrologyLoadedPromise;

        const upperCaseSymbol = symbol.toUpperCase();

        if (this.astrologyMyths && this.astrologyMyths[upperCaseSymbol]) {
            return this.astrologyMyths[upperCaseSymbol];
        } else {
            console.warn(`Short myth not found for symbol: ${symbol} (searched as ${upperCaseSymbol})`);
            return `No short myth found for ${symbol}.`;
        }
    }

    // Method to get a long myth by symbol (asynchronous)
    async getMythLong(symbol: string): Promise<string> {
        await this.astrologyLongLoadedPromise;

        const upperCaseSymbol = symbol.toUpperCase();

        if (this.astrologyMythsLong && this.astrologyMythsLong[upperCaseSymbol]) {
            return this.astrologyMythsLong[upperCaseSymbol];
        } else {
            console.warn(`Long myth not found for symbol: ${symbol} (searched as ${upperCaseSymbol})`);
            return `No long myth found for ${symbol}.`;
        }
    }

    // Method to update the astrology data
    updateAstrologyData(data: AstrologyData) {
        this.astrologyDataSource.next(data);
    }

    // Method to get the current value (useful if needed synchronously, though observable is preferred)
    getCurrentData(): AstrologyData {
        return this.astrologyDataSource.getValue();
    }

    // Method to clear the data
    clearData() {
        this.astrologyDataSource.next(this.initialData);
    }
}
