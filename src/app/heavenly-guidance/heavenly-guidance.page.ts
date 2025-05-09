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
import { micOutline, squareOutline, chevronDownOutline, chevronUpOutline, chevronBackOutline } from 'ionicons/icons';
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
  horoscope: string | null = null;
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
    addIcons({ chevronBackOutline, micOutline, squareOutline, chevronDownOutline, chevronUpOutline });
  }

  async ngOnInit() {
    this.selectedZodiac = await this.userProfileService.getSelectedZodiacSign();
    console.log('HeavenlyGuidancePage: Loaded sign:', this.selectedZodiac);
    if (this.selectedZodiac) {
      this.showZodiacSelection = false;
    }
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
      this.horoscope = null;
      this.horoscopeError = null;
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
    this.horoscope = null;
    this.horoscopeError = null;

    this.horoscopeService.getGoogleAiHoroscope(this.selectedZodiac, this.googleAiApiKey, this.googleAiProjectName)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          console.log('HeavenlyGuidancePage: Google AI guidance fetch finalized.');
        })
      )
      .subscribe({
        next: (guidance) => {
          console.log('HeavenlyGuidancePage: Received details from Google AI call simulation:', guidance);
          // For now, we display the detailed prompt/simulation info.
          // In a real implementation, this would be the AI-generated horoscope.
          if (guidance.startsWith('FAIL:')) { // Check if the service returned a simulated failure
            this.horoscope = null;
            this.horoscopeError = guidance;
          } else {
            this.horoscope = guidance; // Displaying the prompt/details from the service
            this.horoscopeError = null;
          }
        },
        error: (err) => {
          console.error('HeavenlyGuidancePage: Error getting Google AI guidance:', err);
          let message = 'An unexpected error occurred while fetching guidance from Google AI.';
          if (err instanceof Error) { message = err.message; }
          else if (typeof err === 'string') { message = err; }
          this.horoscopeError = message;
          this.horoscope = null;
        }
      });
  }

  async narrateGuidance() {
    if (!this.horoscope) {
      await this.presentErrorAlert('Narration Error', 'No guidance text available to narrate.');
      return;
    }
    console.log('Narrating guidance...');
    await this.speakText(this.horoscope, 'Guidance Narration');
  }

  stopReading() {
    console.log('Stopping TTS...');
    TextToSpeech.stop();
  }

  private async speakText(text: string, logContext: string) {
    try {
      await TextToSpeech.speak({
        text: text,
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
