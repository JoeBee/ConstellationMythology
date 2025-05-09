import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
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

  // private apiUrl = 'https://aztro.sameerkumar.website';
  private googleAiApiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'; // Changed to gemini-2.0-flash


  constructor(private http: HttpClient) { }

  private longitudeToSign(longitude: number): string {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    // Longitude in astronomy-engine is 0-360, starting at the vernal equinox (0° Aries)
    const signIndex = Math.floor(longitude / 30);
    return signs[signIndex % 12];
  }

  getGoogleAiHoroscope(userSign: string, apiKey: string, projectName: string): Observable<string> {
    const date = new Date();
    let promptDetails = `[Google AI Horoscope Generation Details]\n`;
    promptDetails += `Project: ${projectName}\n`;
    promptDetails += `User Sign: ${userSign}\n`;
    promptDetails += `Date: ${date.toISOString()}\n`;

    // Calculate planet positions (reusing existing logic structure)
    const planetsToCalculate = [
      { name: 'Sun', body: Astronomy.Body.Sun },
      { name: 'Moon', body: Astronomy.Body.Moon },
      { name: 'Mercury', body: Astronomy.Body.Mercury },
      { name: 'Venus', body: Astronomy.Body.Venus },
      { name: 'Mars', body: Astronomy.Body.Mars },
      { name: 'Jupiter', body: Astronomy.Body.Jupiter },
      { name: 'Saturn', body: Astronomy.Body.Saturn },
      { name: 'Uranus', body: Astronomy.Body.Uranus },
      { name: 'Neptune', body: Astronomy.Body.Neptune },
      { name: 'Pluto', body: Astronomy.Body.Pluto } // Pluto is often used in modern astrology
    ];

    let planetPositionsInfo: PlanetInfo[] = [];
    let calculationErrorMsg: string | null = null;

    promptDetails += "\nPlanetary Positions:\n";
    for (const p of planetsToCalculate) {
      try {
        const vector = Astronomy.GeoVector(p.body, date, true);
        const spherical = Astronomy.SphereFromVector(vector);
        const longitude = spherical.lon;
        const sign = this.longitudeToSign(longitude);
        planetPositionsInfo.push({ name: p.name, sign: sign });
        promptDetails += `  - ${p.name}: ${longitude.toFixed(2)}° (${sign})\n`;
      } catch (calcError: any) {
        const errorMsg = `Error calculating ${p.name}: ${calcError.message || calcError}`;
        promptDetails += `  - ${p.name}: Calculation Error - ${errorMsg}\n`;
        console.error(`[GoogleAI Horoscope] ${errorMsg}`);
        if (!calculationErrorMsg) calculationErrorMsg = "Partial planetary data due to calculation error.";
      }
    }

    if (calculationErrorMsg) {
      promptDetails += `\nNote: ${calculationErrorMsg}\n`;
    }

    // Further astrological data (placeholders or simple examples)
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    promptDetails += `\nDay of the Year: ${dayOfYear}\n`;
    // Aspects, houses, etc., would be calculated here or included in the prompt.
    // For simplicity, we'll just note their importance.
    promptDetails += `Considerations for AI: Major aspects (conjunctions, oppositions, trines, squares, sextiles) between planets, planets in houses, Moon phase.\n`;

    const fullPrompt = `You are an expert astrologer. Generate a personalized, insightful, and uplifting horoscope for ${userSign}.
Current Date: ${date.toDateString()}.
Planetary Positions:
${planetPositionsInfo.map(p => `- ${p.name} is in ${p.sign}`).join('\n')}
Other Astrological Factors:
- Day of the year: ${dayOfYear}
- Current Moon Phase: (e.g., Waxing Crescent - this would be calculated)
- Dominant planetary aspects and their influence.
- The user's sun sign is ${userSign}. Consider how the current transits affect this sign specifically.
- Infuse mythological archetypes relevant to ${userSign} and the current planetary alignments.
- Provide actionable advice or areas of focus for the day/week.
- The tone should be mystical yet practical.

Horoscope:
`;

    promptDetails += `\n--- PROMPT FOR GOOGLE AI ---
${fullPrompt}
--- END PROMPT ---

This prompt would be sent to a Google AI model (e.g., Gemini) using the API Key (ending with ${apiKey.slice(-5)}) for project '${projectName}'.
The actual HTTP call would look something like:
POST ${this.googleAiApiUrl}?key=${apiKey}
Body: { "contents": [{ "parts": [{ "text": "..." }] }] }
`;
    // In a real app, you'd make the HTTP call here:

    // console.log('*** URL', `${this.googleAiApiUrl}?key=${apiKey}`);
    // console.log('*** Google AI Horoscope:', fullPrompt);
    return this.http.post<any>(`${this.googleAiApiUrl}?key=${apiKey}`,
      { contents: [{ parts: [{ text: fullPrompt }] }] }).pipe(
        // tap(response => console.log('*** Full Google AI API Response:', response)),
        map(response => {
          // console.log('*** response', response);

          // Basic safety check for the expected structure
          if (response && response.candidates &&
            response.candidates[0] &&
            response.candidates[0].content && response.candidates[0].content.parts &&
            response.candidates[0].content.parts[0]) {
            // return '===xyz' + response + '===xxx' +            
            let rawText = response?.candidates[0]?.content?.parts[0]?.text;
            // console.log('*** text', text);
            if (rawText) {
              // Ensure 'this' context is correct if formatHoroscopeTextToHtml is called from a different context in real usage.
              // Here, it should be fine as it's a method of the same class instance.
              return this.formatHoroscopeTextToHtml(rawText);
            }
            console.warn('No horoscope text found in AI response parts.');
            return 'Could not retrieve guidance at this time. The stars are silent.'; // Fallback message
          }
          console.warn('Unexpected AI response structure:', response);
          return '======' + response + '====== Unexpected response structure from AI.';
        }),
        catchError(error => {
          console.error('Google AI API Error:', error);
          return of(`========= FAIL: Error contacting Google AI: ${error.message}`);
        })
      );

    // For now, returning the constructed prompt and simulation details
    // return of(promptDetails);
  }

  private formatHoroscopeTextToHtml(markdownText: string): string {

    console.log('*** *** *** *** *** *** *** *** *** *** *** ');
    console.log('*** markdownText', markdownText);
    let resultHtml = '';
    const originalLines = markdownText.split('\n');
    let inListScope = false;

    for (let i = 0; i < originalLines.length; i++) {
      let line = originalLines[i];

      // Preserve empty lines for paragraph spacing by pre-wrap, but trim other lines for matching
      if (line.trim() === '') {
        resultHtml += '\n';
        continue;
      }

      const trimmedLine = line.trim();

      // ## Headers
      if (trimmedLine.startsWith('## ')) {
        if (inListScope) {
          resultHtml += '</ul>\n';
          inListScope = false;
        }
        resultHtml += `<h2>${trimmedLine.substring(3).trim()}</h2>\n`;
        continue;
      }
      console.log('*** *** *** *** *** *** *** *** *** *** *** ');
      console.log('*** resultHtml', resultHtml);

      console.log('*** *** *** *** *** *** *** *** *** *** *** ');

      // **Titles:** (e.g., **Actionable Advice:** or **Title:** Followed by text)
      // Covers "**Title:**" and "**Title:** Rest of content"
      const specialTitleMatch = trimmedLine.match(/^\*\*(.+?):\*\*(.*$)/);
      if (specialTitleMatch) {
        if (inListScope) {
          resultHtml += '</ul>\n';
          inListScope = false;
        }
        const titleText = specialTitleMatch[1].trim();
        const restOfLineContent = specialTitleMatch[2].trim();
        resultHtml += `<b>${titleText}:</b>`;
        if (restOfLineContent) {
          // Process **bold** in the restOfLineContent before wrapping in <p>
          const processedRestOfLine = restOfLineContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          resultHtml += `<p>${processedRestOfLine}</p>`;
        }
        continue;
      }

      // List items: *   ...
      if (trimmedLine.startsWith('*   ')) {
        if (!inListScope) {
          resultHtml += '<ul>';
          inListScope = true;
        }
        let listItemContent = trimmedLine.substring(4); // Remove "*   "
        // **Bold part:** within list items
        listItemContent = listItemContent.replace(/^\*\*(.+?):\*\*(.*)/, '<strong>$1:</strong>$2');
        // General **bold** within list item content (if not part of the structure above)
        listItemContent = listItemContent.replace(/\*\*(.*?)\*\*/g, (match, p1) => {
          // Avoid re-processing if already handled by the structured bold above
          if (match.startsWith('<strong>') && match.endsWith('</strong>')) return match;
          return `<strong>${p1}</strong>`;
        });
        resultHtml += `  <li>${listItemContent}</li>`;
        continue;
      }

      // If not a list item and we were in a list, close it
      if (inListScope) {
        resultHtml += '</ul>';
        inListScope = false;
      }

      // General paragraph lines: apply **bold** transformation
      const processedLine = trimmedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      resultHtml += processedLine + '\n';
    }

    // Close list if the text ends with one
    if (inListScope) {
      resultHtml += '</ul>';
    }

    return resultHtml.trim(); // Trim trailing newline if any
  }

}
