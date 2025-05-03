import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

const ZODIAC_SIGN_KEY = 'selectedZodiacSign';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {

  constructor() { }

  async setSelectedZodiacSign(sign: string): Promise<void> {
    await Preferences.set({
      key: ZODIAC_SIGN_KEY,
      value: sign,
    });
    console.log('Saved zodiac sign:', sign);
  }

  async getSelectedZodiacSign(): Promise<string | null> {
    const { value } = await Preferences.get({ key: ZODIAC_SIGN_KEY });
    console.log('Loaded zodiac sign:', value);
    return value;
  }

  async clearSelectedZodiacSign(): Promise<void> {
    await Preferences.remove({ key: ZODIAC_SIGN_KEY });
    console.log('Cleared zodiac sign.');
  }
}
