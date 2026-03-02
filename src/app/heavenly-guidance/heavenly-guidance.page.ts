import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonListHeader,
  IonLabel,
  IonItem,
  IonRadioGroup,
  IonRadio,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonNote,
  IonSpinner,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  AlertController,
  Gesture,
  GestureController
} from '@ionic/angular/standalone';
import { UserProfileService } from '../services/user-profile.service';
import { HoroscopeService } from '../services/horoscope.service';
import { finalize } from 'rxjs/operators';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { addIcons } from 'ionicons';
import { micOutline, square, chevronDownOutline, chevronUpOutline, chevronBackOutline } from 'ionicons/icons';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

// Interface for the zodiac sign object
interface ZodiacSign {
  name: string;
  icon: string; // Path to the custom SVG icon
}

@Component({
  selector: 'app-heavenly-guidance',
  templateUrl: './heavenly-guidance.page.html',
  styleUrls: ['./heavenly-guidance.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonListHeader,
    IonLabel,
    IonItem,
    IonRadioGroup,
    IonRadio,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonNote,
    IonSpinner,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon
  ]
})
export class HeavenlyGuidancePage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(IonContent) content!: IonContent;
  private gesture?: Gesture;

  // Google AI Configuration
  private googleAiApiKey = environment.googleAiApiKey;
  private googleAiProjectName = 'ConstellationMythology';

  // Updated zodiacSigns array to include icon paths
  zodiacSigns: ZodiacSign[] = [
    { name: 'Aries', icon: 'assets/icons/zodiac/aries.svg' },
    { name: 'Taurus', icon: 'assets/icons/zodiac/taurus.svg' },
    { name: 'Gemini', icon: 'assets/icons/zodiac/gemini.svg' },
    { name: 'Cancer', icon: 'assets/icons/zodiac/cancer.svg' },
    { name: 'Leo', icon: 'assets/icons/zodiac/leo.svg' },
    { name: 'Virgo', icon: 'assets/icons/zodiac/virgo.svg' },
    { name: 'Libra', icon: 'assets/icons/zodiac/libra.svg' },
    { name: 'Scorpio', icon: 'assets/icons/zodiac/scorpio.svg' },
    { name: 'Sagittarius', icon: 'assets/icons/zodiac/sagittarius.svg' },
    { name: 'Capricorn', icon: 'assets/icons/zodiac/capricorn.svg' },
    { name: 'Aquarius', icon: 'assets/icons/zodiac/aquarius.svg' },
    { name: 'Pisces', icon: 'assets/icons/zodiac/pisces.svg' }
  ];

  selectedZodiac: string | null = null;
  horoscopeSummary: string | null = null;
  horoscopeDetails: string | null = null;
  // public naratingSummary: string | null = null;
  // public originalMdHoroscopeSummary: string | null = null;
  // public originalMdHoroscopeDetails: string | null = null;

  horoscopeError: string | null = null;
  isLoading: boolean = false;
  showZodiacSelection: boolean = true;

  constructor(
    private userProfileService: UserProfileService,
    private horoscopeService: HoroscopeService,
    private alertController: AlertController,
    private router: Router,
    private gestureCtrl: GestureController
  ) {
    addIcons({ chevronBackOutline, micOutline, square, chevronDownOutline, chevronUpOutline });
  }

  async ngOnInit() {
    this.selectedZodiac = await this.userProfileService.getSelectedZodiacSign();
    console.log('HeavenlyGuidancePage: Loaded sign:', this.selectedZodiac);
    if (this.selectedZodiac) {
      this.showZodiacSelection = false;
      // Clear any existing horoscope data from localStorage on app start
      localStorage.removeItem('horoscopeSummary');
      localStorage.removeItem('horoscopeDetails');
      localStorage.removeItem('horoscopeZodiac');
      console.log('HeavenlyGuidancePage: Cleared any existing horoscope data on app start.');
    }

    // Add event listener for window:beforeunload
    window.addEventListener('beforeunload', this.clearHoroscopeData);
  }

  // Add method to clear horoscope data
  private clearHoroscopeData = () => {
    // Clear horoscope data from component properties
    this.horoscopeSummary = null;
    this.horoscopeDetails = null;
    this.horoscopeError = null;

    // Clear horoscope data from localStorage
    localStorage.removeItem('horoscopeSummary');
    localStorage.removeItem('horoscopeDetails');
    localStorage.removeItem('horoscopeZodiac');

    console.log('HeavenlyGuidancePage: Cleared horoscope data on window unload.');
  }

  toggleZodiacSelection() {
    this.showZodiacSelection = !this.showZodiacSelection;
    console.log('Toggled Zodiac Selection visibility to:', this.showZodiacSelection);
  }

  async zodiacChanged(event: any) {
    const newSign = event.detail.value;
    console.log('HeavenlyGuidancePage: Zodiac changed to:', newSign);
    if (newSign) {
      this.selectedZodiac = newSign;
      await this.userProfileService.setSelectedZodiacSign(newSign);
      this.showZodiacSelection = false;
      this.horoscopeSummary = null;
      this.horoscopeDetails = null;
      this.horoscopeError = null;
      // this.originalMdHoroscopeSummary = null;
      // this.originalMdHoroscopeDetails = null;
      // Clear stored horoscope data from localStorage
      localStorage.removeItem('horoscopeSummary');
      localStorage.removeItem('horoscopeDetails');
      localStorage.removeItem('horoscopeZodiac');
      console.log('HeavenlyGuidancePage: Cleared horoscope data from localStorage due to zodiac change.');
    }
  }

  getGuidance() {
    if (!this.selectedZodiac) {
      console.warn('HeavenlyGuidancePage: No zodiac sign selected.');
      this.presentErrorAlert('Selection Missing', 'Please select a zodiac sign first.');
      return;
    }
    console.log('HeavenlyGuidancePage: Getting guidance for:', this.selectedZodiac, 'using Google AI.');
    this.isLoading = true;
    this.horoscopeSummary = null;
    // this.originalMdHoroscopeSummary = null;
    this.horoscopeDetails = null;
    // this.originalMdHoroscopeDetails = null;
    this.horoscopeError = null;

    this.horoscopeService.getGoogleAiHoroscope(
      this.selectedZodiac, this.googleAiApiKey, this.googleAiProjectName)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          console.log('HeavenlyGuidancePage: Google AI guidance fetch finalized.');
        })
      )
      .subscribe({
        next: (guidance) => {
          console.log('HeavenlyGuidancePage: Received details from Google AI call simulation:', guidance);
          if (guidance.startsWith('FAIL:')) {
            this.horoscopeSummary = null;
            this.horoscopeDetails = null;
            this.horoscopeError = guidance;
          } else {
            const separator = "<b>Guidance Details:</b>";
            let parts = guidance.split(separator, 2);
            let summaryText = parts[0];
            let detailsText = parts.length > 1 ? separator + parts[1] : '';
            this.horoscopeSummary = summaryText.trim();
            this.horoscopeDetails = detailsText.trim();

            // Save horoscope data to localStorage
            if (this.selectedZodiac) {
              localStorage.setItem('horoscopeSummary', this.horoscopeSummary);
              localStorage.setItem('horoscopeDetails', this.horoscopeDetails);
              localStorage.setItem('horoscopeZodiac', this.selectedZodiac);
              console.log('HeavenlyGuidancePage: Saved horoscope data to localStorage.');
            }

            this.horoscopeError = null;
          }
        },
        error: (err) => {
          console.error('HeavenlyGuidancePage: Error getting Google AI guidance:', err);
          let message = 'An unexpected error occurred while fetching guidance from Google AI.';
          if (err instanceof Error) { message = err.message; }
          else if (typeof err === 'string') { message = err; }
          this.horoscopeError = message;
          this.horoscopeSummary = null;
          // this.originalMdHoroscopeSummary = null;
          this.horoscopeDetails = null;
          // this.originalMdHoroscopeDetails = null;
        }
      });
  }

  async narrateSummaryGuidance() {
    if (!this.horoscopeSummary) {
      await this.presentErrorAlert('Narration Error', 'No guidance text available to narrate.');
      return;
    }
    console.log('Narrating summary guidance...');
    await this.speakText(this.horoscopeSummary, 'Summary Guidance Narration');
  }

  async narrateDetailsGuidance() {
    if (!this.horoscopeDetails) {
      await this.presentErrorAlert('Narration Error', 'No guidance text available to narrate.');
      return;
    }
    console.log('Narrating details guidance...');

    const paragraphs = this.horoscopeDetails.split('\n\n');
    for (const paragraph of paragraphs) {
      // Add a small delay between speaking paragraphs if needed, e.g., await new Promise(resolve => setTimeout(resolve, 500));
      await this.speakText(paragraph.trim(), 'Details Guidance Narration - Paragraph');
      // Check if TTS was stopped, and if so, break the loop
      // This part assumes you have a way to check if TTS was stopped, e.g., a flag set by stopReading()
      // For now, this is a conceptual addition as the stopReading method doesn't seem to set a global flag.
      // if (this.isTTSSpeaking === false) { // Example check
      //   console.log('TTS stopped, breaking narration loop.');
      //   break;
      // }
    }
  }

  stopReading() {
    try {
      TextToSpeech.stop();
    } catch (error) {
      console.error('Error stopping TTS:', error);
    }
  }

  // Added helper method to strip HTML
  private stripHtml(html: string): string {
    try {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return doc.body.textContent || "";
    } catch (e) {
      console.error('Error stripping HTML:', e);
      return html; // Return original html if stripping fails
    }
  }

  private async speakText(text: string | null, logContext: string) {
    if (!text) {
      console.warn('speakText: No text to speak.');
      return;
    }
    try {
      const strippedText = this.stripHtml(text);

      await TextToSpeech.speak({
        text: strippedText,
        lang: 'en-US', rate: 1.0, pitch: 1.0, volume: 1.0, category: 'ambient'
      });
      console.log(`TTS started successfully for ${logContext}.`);
    } catch (error) {
      console.error(`Error starting TTS for ${logContext}:`, error);
      let errorMessage = 'Could not start text-to-speech.';
      if (error instanceof Error) { errorMessage = error.message; }
      await this.presentErrorAlert('TTS Error', errorMessage);
    }
  }

  async presentErrorAlert(header: string, message: string) {
    try {
      const alert = await this.alertController.create({
        header: header,
        message: message,
        buttons: ['OK']
      });
      await alert.present();
    } catch (e) {
      console.error("Error presenting alert:", e);
    }
  }

  ngAfterViewInit() {
    this.setupSwipeGesture();
  }

  ngOnDestroy() {
    this.gesture?.destroy();

    // Remove the beforeunload event listener
    window.removeEventListener('beforeunload', this.clearHoroscopeData);

    // Clear horoscope data
    this.clearHoroscopeData();
  }

  async setupSwipeGesture() {
    const contentEl = await this.content.getScrollElement();
    this.gesture = this.gestureCtrl.create({
      el: contentEl,
      gestureName: 'swipe-right',
      direction: 'x',
      threshold: 15,
      onEnd: (detail) => {
        if (detail.deltaX > 100 && Math.abs(detail.deltaY) < 100) {
          console.log('Swipe right detected on Heavenly Guidance page');
          this.navigateBack();
        }
      }
    }, true);

    this.gesture.enable(true);
    console.log('Swipe gesture enabled for Heavenly Guidance page');
  }

  navigateBack() {
    console.log('Navigating back to Astrology page from Heavenly Guidance');
    this.router.navigateByUrl('/tabs/astrology', { replaceUrl: true });
  }
}
