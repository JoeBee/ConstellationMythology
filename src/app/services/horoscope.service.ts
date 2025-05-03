import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import * as Astronomy from 'astronomy-engine'; // <-- Import astronomy-engine

// Basic interface for the expected response structure
export interface AztroResponse {
  current_date: string;
  compatibility: string;
  lucky_time: string;
  lucky_number: string;
  color: string;
  date_range: string;
  mood: string;
  description: string;
}

// Interface for calculated planet positions
interface PlanetInfo {
  name: string;
  sign: string;
}

@Injectable({
  providedIn: 'root'
})
export class HoroscopeService {

  private apiUrl = 'https://aztro.sameerkumar.website';

  // Simple map of signs to relevant gods/themes for flavoring
  private mythologyMap: { [key: string]: string[] } = {
    'aries': ['Ares', 'Mars', 'battle', 'courage', 'impulse'],
    'taurus': ['Aphrodite', 'Venus', 'beauty', 'pleasure', 'stubbornness'],
    'gemini': ['Hermes', 'Mercury', 'communication', 'duality', 'trickery'],
    'cancer': ['Artemis', 'Diana', 'the Moon', 'nurturing', 'protection'],
    'leo': ['Apollo', 'the Sun', 'creativity', 'drama', 'leadership'],
    'virgo': ['Demeter', 'Ceres', 'harvest', 'details', 'service'],
    'libra': ['Hera', 'Juno', 'balance', 'justice', 'relationships'],
    'scorpio': ['Hades', 'Pluto', 'transformation', 'intensity', 'secrets'],
    'sagittarius': ['Zeus', 'Jupiter', 'expansion', 'philosophy', 'travel'],
    'capricorn': ['Cronus', 'Saturn', 'discipline', 'ambition', 'structure'],
    'aquarius': ['Uranus', 'innovation', 'community', 'rebellion'],
    'pisces': ['Poseidon', 'Neptune', 'dreams', 'intuition', 'illusion']
  };

  // Map of planets to mythological figures/themes
  private planetMythology: { [key: string]: string } = {
    'Sun': 'Apollo',
    'Moon': 'Artemis',
    'Mercury': 'Hermes',
    'Venus': 'Aphrodite',
    'Mars': 'Ares',
    'Jupiter': 'Zeus',
    'Saturn': 'Cronus'
  };

  // Map of sign keywords (can be expanded)
  private signKeywords: { [key: string]: string[] } = {
    'Aries': ['action', 'courage', 'impulse', 'beginnings'],
    'Taurus': ['stability', 'pleasure', 'patience', 'possessions'],
    'Gemini': ['communication', 'curiosity', 'ideas', 'adaptability'],
    'Cancer': ['emotion', 'nurturing', 'home', 'security'],
    'Leo': ['creativity', 'leadership', 'drama', 'recognition'],
    'Virgo': ['analysis', 'details', 'health', 'service'],
    'Libra': ['harmony', 'relationships', 'justice', 'beauty'],
    'Scorpio': ['intensity', 'transformation', 'secrets', 'power'],
    'Sagittarius': ['expansion', 'philosophy', 'travel', 'optimism'],
    'Capricorn': ['discipline', 'ambition', 'structure', 'responsibility'],
    'Aquarius': ['innovation', 'community', 'freedom', 'ideals'],
    'Pisces': ['intuition', 'dreams', 'compassion', 'spirituality']
  };

  constructor(private http: HttpClient) { }

  getDailyHoroscope(sign: string): Observable<string> {
    const lowerCaseSign = sign.toLowerCase();
    const params = new HttpParams()
      .set('sign', lowerCaseSign)
      .set('day', 'today');

    // Aztro uses POST, even though we are just fetching data with params
    return this.http.post<AztroResponse>(this.apiUrl, null, { params }).pipe(
      map(response => {
        if (response && response.description) {
          return this.addMythologicalFlavor(lowerCaseSign, response.description);
        } else {
          console.warn('Horoscope description not found in API response for:', sign);
          return 'Could not retrieve guidance at this time. The Olympians are busy.';
        }
      }),
      catchError(error => {
        console.error('Error fetching horoscope for:', sign, error);
        return of('The connection to the Oracle is unclear. Please try again later.'); // Return a user-friendly error message
      })
    );
  }

  generateAstrologicalGuidance(userSign: string): Observable<string> {
    let debugInfo = `[DEBUG V4] Generating for ${userSign}\n`;
    try {
      const date = new Date();
      debugInfo += `Date: ${date.toISOString()}\n`;

      const planetsToCalculate = [
        { name: 'Sun', body: Astronomy.Body.Sun },
        { name: 'Moon', body: Astronomy.Body.Moon },
        { name: 'Mercury', body: Astronomy.Body.Mercury },
        { name: 'Venus', body: Astronomy.Body.Venus },
        { name: 'Mars', body: Astronomy.Body.Mars },
        { name: 'Jupiter', body: Astronomy.Body.Jupiter },
        { name: 'Saturn', body: Astronomy.Body.Saturn }
      ];

      let planetPositions: PlanetInfo[] = [];
      let calculationError: Error | null = null;

      for (const p of planetsToCalculate) {
        try {
          debugInfo += `Calc ${p.name}... `; // Log start
          const vector = Astronomy.GeoVector(p.body, date, true);
          const spherical = Astronomy.SphereFromVector(vector);
          const longitude = spherical.lon;

          debugInfo += `Lon: ${longitude.toFixed(2)}° -> `; // Log success
          const sign = this.longitudeToSign(longitude);
          debugInfo += `${sign}\n`; // Log sign
          planetPositions.push({ name: p.name, sign: sign });
        } catch (calcError: any) {
          debugInfo += `FAIL: ${calcError.message || calcError}\n`;
          console.error(`[Guidance Service] Error calculating ${p.name}:`, calcError);
          calculationError = calcError as Error;
          break;
        }
      }

      if (calculationError) {
        debugInfo += `\nError during calculation: ${calculationError.message}`;
        return of(debugInfo);
      }

      debugInfo += `\nPositions: ${JSON.stringify(planetPositions)}\n`;

      try {
        const guidance = this.buildGuidanceText(userSign, planetPositions);
        console.log('[Guidance Service] Successfully generated guidance.');
        return of(guidance);
      } catch (buildError: any) {
        debugInfo += `\nError building text: ${buildError.message || buildError}`;
        console.error('[Guidance Service] Error during buildGuidanceText:', buildError);
        return of(debugInfo);
      }

    } catch (error: any) {
      debugInfo += `\nUnexpected outer error: ${error.message || error}`;
      console.error('[Guidance Service] Outer error during guidance generation:', error);
      return of(debugInfo);
    }
  }

  private longitudeToSign(longitude: number): string {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    // Longitude in astronomy-engine is 0-360, starting at the vernal equinox (0° Aries)
    const signIndex = Math.floor(longitude / 30);
    return signs[signIndex % 12];
  }

  private buildGuidanceText(userSign: string, planetPositions: PlanetInfo[]): string {
    let text = `Guidance for ${userSign}:\n\n`; // Start with double newline for formatting

    // Use a more dynamic approach to include info for all calculated planets
    planetPositions.forEach(planetInfo => {
      const myth = this.planetMythology[planetInfo.name] || planetInfo.name;
      const signKeywords = this.signKeywords[planetInfo.sign] || [];
      const randomKeyword = signKeywords[Math.floor(Math.random() * signKeywords.length)] || 'influence';
      text += `${planetInfo.name} (${myth}) in ${planetInfo.sign} brings focus to ${randomKeyword}.\n`;
    });


    // Add a generic closing based on user sign
    const userSignKeywords = this.signKeywords[userSign] || [];
    const randomUserKeyword = userSignKeywords[Math.floor(Math.random() * userSignKeywords.length)] || 'path';
    text += `\nConsider these celestial currents and how they interact with your unique ${userSign} ${randomUserKeyword}.`;

    // Simple placeholder if generation fails somehow
    if (planetPositions.length === 0) { // Check if positions array is empty
      text = `Today's celestial patterns offer unique insights for ${userSign}. Reflect on your inner compass.`;
    }

    return text;
  }

  private addMythologicalFlavor(sign: string, description: string): string {
    const keywords = this.mythologyMap[sign];
    if (!keywords || keywords.length === 0) {
      return description; // No keywords for this sign
    }

    // Simple approach: Pick one random keyword and append a related sentence.
    const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
    const flavorText = ` Keep the wisdom of ${randomKeyword} in mind as you navigate the day.`; // Example sentence

    // More sophisticated mixing could be done here (e.g., replacing words, conditional additions)

    return description + flavorText;
  }

}
