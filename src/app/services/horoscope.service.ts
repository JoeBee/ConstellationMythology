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
        return of('yyyyy' + guidance + 'zzzzz');
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
    // Get personalized keywords for user's sign
    const userSignKeywords = this.signKeywords[userSign] || [];
    const randomUserKeyword = userSignKeywords[Math.floor(Math.random() * userSignKeywords.length)] || 'path';

    // Analyze planetary positions and extract insights
    const signCounts: { [key: string]: number } = {};
    const elementCounts: { [key: string]: number } = { fire: 0, earth: 0, air: 0, water: 0 };
    const signToElement: { [key: string]: string } = {
      'Aries': 'fire', 'Leo': 'fire', 'Sagittarius': 'fire',
      'Taurus': 'earth', 'Virgo': 'earth', 'Capricorn': 'earth',
      'Gemini': 'air', 'Libra': 'air', 'Aquarius': 'air',
      'Cancer': 'water', 'Scorpio': 'water', 'Pisces': 'water'
    };

    // Track planets in user's sign and planets in harmonious signs
    const planetsInUserSign: string[] = [];
    const userElement = signToElement[userSign] || '';

    // Calculate sign and element distributions
    planetPositions.forEach(planet => {
      // Count signs
      signCounts[planet.sign] = (signCounts[planet.sign] || 0) + 1;

      // Count elements
      const element = signToElement[planet.sign];
      if (element) elementCounts[element] += 1;

      // Track planets in user's sign
      if (planet.sign === userSign) {
        planetsInUserSign.push(planet.name);
      }
    });

    // Find dominant sign and element
    let dominantSign = '';
    let dominantElement = '';
    let maxSignCount = 0;
    let maxElementCount = 0;

    for (const sign in signCounts) {
      if (signCounts[sign] > maxSignCount) {
        maxSignCount = signCounts[sign];
        dominantSign = sign;
      }
    }

    for (const element in elementCounts) {
      if (elementCounts[element] > maxElementCount) {
        maxElementCount = elementCounts[element];
        dominantElement = element;
      }
    }

    // Get keywords for dominant sign
    const dominantSignKeywords = this.signKeywords[dominantSign] || [];
    const dominantTheme = dominantSignKeywords[Math.floor(Math.random() * dominantSignKeywords.length)] || 'energy';

    // Calculate harmonic or challenging relationship between user sign and dominant sign
    const userSignIndex = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'].indexOf(userSign);
    const dominantSignIndex = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'].indexOf(dominantSign);

    // Calculate aspect (difference in positions)
    const difference = Math.abs(userSignIndex - dominantSignIndex);

    // Define the relationship type
    let relationshipType = '';
    if (difference === 0) relationshipType = 'conjunction';
    else if (difference === 4 || difference === 8) relationshipType = 'trine'; // Harmonious
    else if (difference === 3 || difference === 9) relationshipType = 'square'; // Challenging
    else if (difference === 6) relationshipType = 'opposition'; // Polarizing
    else if (difference === 2 || difference === 10) relationshipType = 'sextile'; // Supportive
    else relationshipType = 'neutral';

    // Generate title based on dominant element and sign
    let title;
    if (dominantElement === userElement) {
      title = `Your ${dominantElement.toUpperCase()} Element Is Amplified Today. `;
    } else if (relationshipType === 'trine' || relationshipType === 'sextile') {
      title = `${dominantSign} Energy Harmonizes With Your ${userSign} Nature. `;
    } else if (relationshipType === 'square' || relationshipType === 'opposition') {
      title = `Navigating ${dominantSign} Influence As A ${userSign}. `;
    } else {
      title = `Your Daily Celestial Guidance. `;
    }
    // title += '$$$$$';

    // Generate introduction based on planets in user sign
    let introduction;
    if (planetsInUserSign.length > 1) {
      introduction = `With ${planetsInUserSign.join(' and ')} in your sign, your ${randomUserKeyword} is especially highlighted today.`;
    } else if (dominantElement === userElement) {
      introduction = `The stars are amplifying your natural ${userElement} element, strengthening your ${randomUserKeyword}.`;
    } else if (relationshipType === 'trine' || relationshipType === 'sextile') {
      introduction = `Today's ${dominantSign} influence flows harmoniously with your ${userSign} energy, enhancing your ${randomUserKeyword}.`;
    } else if (relationshipType === 'square' || relationshipType === 'opposition') {
      introduction = `Today's ${dominantSign} energy creates productive tension with your ${userSign} nature, challenging your ${randomUserKeyword}.`;
    } else {
      introduction = `Today's celestial bodies are aligning to illuminate your ${randomUserKeyword}.`;
    }

    // Assemble the guidance text
    // let top = `${title}\n\n${introduction} The stars reveal:\n\n`;
    let topIntro = `topIntro: ${title} ${introduction}\n`;
    let granularDetails = '***granular:';
    // Detail each planet's position and influence with more variation
    planetPositions.forEach(planetInfo => {
      const myth = this.planetMythology[planetInfo.name] || planetInfo.name;
      const signKeywords = this.signKeywords[planetInfo.sign] || [];
      const randomKeyword = signKeywords[Math.floor(Math.random() * signKeywords.length)] || 'influence';


      // Create varied descriptions based on planet type and relationship to user sign
      if (planetInfo.sign === userSign) {
        granularDetails += `° ${planetInfo.name} (${myth}) in your sign of ${planetInfo.sign} strongly amplifies your ${randomKeyword}.\n`;
      } else if (planetInfo.name === 'Sun') {
        granularDetails += `° The ${planetInfo.name} (${myth}) shines in ${planetInfo.sign}, illuminating your ${randomKeyword}.\n`;
      } else if (planetInfo.name === 'Moon') {
        granularDetails += `° The ${planetInfo.name} (${myth}) reflects in ${planetInfo.sign}, touching your emotional ${randomKeyword}.\n`;
      } else if (planetInfo.name === 'Mercury') {
        granularDetails += `° ${planetInfo.name} (${myth}) in ${planetInfo.sign} shapes your thoughts about ${randomKeyword}.\n`;
      } else if (planetInfo.name === 'Venus') {
        granularDetails += `° ${planetInfo.name} (${myth}) in ${planetInfo.sign} colors your appreciation for ${randomKeyword}.\n`;
      } else if (planetInfo.name === 'Mars') {
        granularDetails += `° ${planetInfo.name} (${myth}) in ${planetInfo.sign} energizes your drive toward ${randomKeyword}.\n`;
      } else if (planetInfo.name === 'Jupiter') {
        granularDetails += `° ${planetInfo.name} (${myth}) in ${planetInfo.sign} expands your ${randomKeyword}.\n`;
      } else if (planetInfo.name === 'Saturn') {
        granularDetails += `° ${planetInfo.name} (${myth}) in ${planetInfo.sign} structures your approach to ${randomKeyword}.\n`;
      }
    });

    // Add personalized conclusion based on dominant element and relationship type
    if (relationshipType === 'conjunction') {
      granularDetails += `\nWith ${dominantSign} energy prominent today, your natural ${userSign} ${randomUserKeyword} is strongly emphasized.`;
    } else if (relationshipType === 'trine' || relationshipType === 'sextile') {
      granularDetails += `\nThe ${dominantSign} ${dominantTheme} flows effortlessly with your ${userSign} nature, supporting your ${randomUserKeyword}.`;
    } else if (relationshipType === 'square') {
      granularDetails += `\nThe ${dominantSign} ${dominantTheme} creates productive tension with your ${userSign} approach, pushing you to grow.`;
    } else if (relationshipType === 'opposition') {
      granularDetails += `\nBalance the ${dominantSign} ${dominantTheme} with your natural ${userSign} qualities to find wholeness today.`;
    } else {
      granularDetails += `\nConsider how the ${dominantSign} ${dominantTheme} can complement your ${userSign} ${randomUserKeyword} today.`;
    }
    granularDetails += '+++++';

    let topSumary = '***topSumary:';
    // Add element-specific advice
    if (dominantElement === 'fire') {
      topSumary += `\nEmbrace passion and creative inspiration in your endeavors today.`;
    } else if (dominantElement === 'earth') {
      topSumary += `\nFocus on practical matters and building solid foundations today.`;
    } else if (dominantElement === 'air') {
      topSumary += `\nCommunication and intellectual pursuits are favored today.`;
    } else if (dominantElement === 'water') {
      topSumary += `\nTrust your intuition and emotional depth to guide you today.`;
    }
    granularDetails = '=====' + granularDetails + '=====';

    // Simple placeholder if generation fails somehow
    if (planetPositions.length === 0) {
      topIntro = `Today's celestial patterns offer unique insights for ${userSign}. Reflect on your inner compass.`;
    }

    return topIntro + 'aaaaa' + topSumary + 'bbbbbb' + '\n\nDetails: ' + granularDetails + 'ccccc';
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
