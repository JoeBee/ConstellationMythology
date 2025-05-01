import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface AstrologyData {
    name: string | null;
    symbol: string | null;
    astrology: string | null;
    astrologyLong?: string | null;
    imagePath: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class AstrologyDataService {

    // private dataUrl = 'assets/data/astrologys.json';
    private astrologyUrl = 'assets/data/astrology-short.json';
    private astrologyLongUrl = 'assets/data/astrology-long.json';
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
        astrology: null,
        astrologyLong: null,
        imagePath: null
    };

    // BehaviorSubject to hold the current Astrology data
    private astrologyDataSource = new BehaviorSubject<AstrologyData>(this.initialData);

    // Observable stream for components to subscribe to
    currentAstrologyData = this.astrologyDataSource.asObservable();

    constructor(private http: HttpClient) {
        this.astrologyLoadedPromise = this.loadAstrology();
        this.astrologyLongLoadedPromise = this.loadLongAstrology();
    }

    // Method to load short Astrology from JSON
    private loadAstrology(): Promise<void> {
        console.log('Loading short astrology Astrologys...');
        return firstValueFrom(
            this.http.get<{ [key: string]: string }>(this.astrologyUrl)
                .pipe(
                    tap(astrology => {
                        this.astrologyMyths = astrology;
                        console.log('Short astrology astrology loaded successfully.');
                    })
                )
        ).then(() => { }).catch(error => {
            console.error('Failed to load short astrology astrology:', error);
            this.astrologyMyths = {};
        });
    }

    // Method to load long astrology from JSON
    private loadLongAstrology(): Promise<void> {
        console.log('Loading long astrology astrology...');
        return firstValueFrom(
            this.http.get<{ [key: string]: string }>(this.astrologyLongUrl)
                .pipe(
                    tap(astrology => {
                        this.astrologyMythsLong = astrology;
                        console.log('Long astrology astrology loaded successfully.');
                    })
                )
        ).then(() => { }).catch(error => {
            console.error('Failed to load long astrology astrology:', error);
            this.astrologyMythsLong = {};
        });
    }

    // Method to get a short astrology by symbol (asynchronous)
    async getAstrology(symbol: string): Promise<string> {
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
    async getAstrologyLong(symbol: string): Promise<string> {
        await this.astrologyLongLoadedPromise;

        const upperCaseSymbol = symbol.toUpperCase();

        if (this.astrologyMythsLong && this.astrologyMythsLong[upperCaseSymbol]) {
            return this.astrologyMythsLong[upperCaseSymbol];
        } else {
            console.warn(`Long astrology not found for symbol: ${symbol} (searched as ${upperCaseSymbol})`);
            return `No long astrology found for ${symbol}.`;
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
