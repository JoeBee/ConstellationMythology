import { Component, OnDestroy, OnInit, AfterViewInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonButton, IonIcon,
  AlertController,
  Gesture, GestureController
} from '@ionic/angular/standalone';
import { ConstellationDataService, ConstellationData } from '../services/constellation-data.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { addIcons } from 'ionicons';
import { micOutline } from 'ionicons/icons';
import { triangle, ellipse, square, starOutline, bookOutline } from 'ionicons/icons';
import { chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import { IonTabs, IonTabBar, IonTabButton, IonLabel } from '@ionic/angular/standalone';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-myth',
  templateUrl: 'myth.page.html',
  styleUrls: ['myth.page.scss'],
  standalone: true,
  imports: [

    IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent, CommonModule,
    IonButton, IonIcon,
    IonIcon, IonicModule
  ],
})
export class MythPage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(IonContent) content!: IonContent;
  hasValidData: boolean = false;
  currentMythLong: string | null = null;
  private dataSubscription: Subscription | null = null;
  private gesture?: Gesture;

  constellationData$ = this.constellationService.currentConstellationData;

  constructor(
    private constellationService: ConstellationDataService,
    private alertController: AlertController,
    private router: Router,
    private gestureCtrl: GestureController,
  ) {
    addIcons({ micOutline });
    addIcons({ starOutline, bookOutline, chevronBackOutline, chevronForwardOutline });
  }

  ngOnInit() {
    this.dataSubscription = this.constellationService.currentConstellationData.subscribe(async data => {
      console.log('MythPage received data:', data);
      if (data.name && data.symbol) {
        this.currentMythLong = await this.constellationService.getMythLong(data.symbol);
        this.hasValidData = true;
        console.log('MythPage updated. HasValidData=true, LongMyth fetched.');
      } else {
        this.currentMythLong = null;
        this.hasValidData = false;
      }
    });
  }

  ngAfterViewInit() {
    this.setupSwipeGesture();
  }

  ngOnDestroy() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
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
          console.log('Swipe right detected on Myth page');
          this.router.navigateByUrl('/tabs/constellation', { replaceUrl: true });
        }
        else if (detail.deltaX < -100 && Math.abs(detail.deltaY) < 100) {
          console.log('Swipe left detected on Constellation page');
          this.router.navigateByUrl('/tabs/astrology', { replaceUrl: true });
        }
      }
    }, true);

    this.gesture.enable(true);
    console.log('Swipe gesture enabled for Myth page');
  }

  navigateToConstellation() {
    console.log('Navigating to Constellation page from Myth');
    this.router.navigateByUrl('/tabs/constellation', { replaceUrl: true });
  }

  navigateToAstrology() {
    console.log('Navigating to Astrology page from Myth');
    this.router.navigateByUrl('/tabs/astrology', { replaceUrl: true });
  }

  async narrateMythShort() {
    const currentData = this.constellationService.getCurrentData();
    if (!currentData?.myth || currentData.myth.startsWith('No short myth found')) {
      await this.presentErrorAlert('Narration Error', 'Short myth text not available to narrate.');
      return;
    }
    console.log(`Narrating short myth for: ${currentData.name}`);
    await this.speakText(currentData.myth, 'Short Myth Narration');
  }

  async narrateMythLong() {
    const currentData = this.constellationService.getCurrentData();
    if (!this.currentMythLong || this.currentMythLong.startsWith('No long myth found')) {
      await this.presentErrorAlert('Narration Error', 'Full story text not available to narrate.');
      return;
    }
    console.log(`Narrating full story for: ${currentData?.name}`);
    await this.speakText(this.currentMythLong, 'Full Story Narration');
  }

  private async speakText(text: string, logContext: string) {
    try {
      await TextToSpeech.speak({
        text: text,
        lang: 'en-US', rate: 1.0, pitch: 1.0, volume: 1.0, category: 'ambient'
      });
      console.log(`TTS started successfully for ${logContext} on Myth page.`);
    } catch (error) {
      console.error(`Error starting TTS for ${logContext} on Myth page:`, error);
      let errorMessage = 'Could not start text-to-speech.';
      if (error instanceof Error) { errorMessage = error.message; }
      await this.presentErrorAlert('TTS Error', errorMessage);
    }
  }

  async presentErrorAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
