import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { SplashComponent } from './splash/splash.component';

// Assume these are the paths to your custom SVG files
const zodiacIconPaths = {
  'zodiac-aries': 'assets/icons/zodiac/aries.svg',
  'zodiac-taurus': 'assets/icons/zodiac/taurus.svg',
  'zodiac-gemini': 'assets/icons/zodiac/gemini.svg',
  'zodiac-cancer': 'assets/icons/zodiac/cancer.svg',
  'zodiac-leo': 'assets/icons/zodiac/leo.svg',
  'zodiac-virgo': 'assets/icons/zodiac/virgo.svg',
  'zodiac-libra': 'assets/icons/zodiac/libra.svg',
  'zodiac-scorpio': 'assets/icons/zodiac/scorpio.svg',
  'zodiac-sagittarius': 'assets/icons/zodiac/sagittarius.svg',
  'zodiac-capricorn': 'assets/icons/zodiac/capricorn.svg',
  'zodiac-aquarius': 'assets/icons/zodiac/aquarius.svg',
  'zodiac-pisces': 'assets/icons/zodiac/pisces.svg',
};

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet, SplashComponent],
})
export class AppComponent {
  constructor() {
    // Register custom icons
    // The key used here (e.g., 'zodiac-aries') is what you'd use in ion-icon's 'name' attribute
    // However, since we are using the 'src' attribute directly in the template, explicit registration
    // with addIcons might not be strictly necessary unless you want named access elsewhere.
    // Keeping this registration pattern is good practice if you decide to use the 'name' attribute later.
    addIcons(zodiacIconPaths);
  }
}
