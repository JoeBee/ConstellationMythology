import { Component, OnDestroy, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
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
import { chevronBackOutline } from 'ionicons/icons';
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
  constellationData: ConstellationData | null = null;
  private dataSubscription: Subscription | null = null;
  private gesture?: Gesture;

  constructor(
    private constellationService: ConstellationDataService,
    private alertController: AlertController,
    private router: Router,
    private gestureCtrl: GestureController,
    private elementRef: ElementRef
  ) {
    addIcons({ micOutline });
    addIcons({ triangle, ellipse, square, starOutline, bookOutline, chevronBackOutline });
  }

  ngOnInit() {
    this.dataSubscription = this.constellationService.currentConstellationData.subscribe(data => {
      console.log('MythPage received data:', data);
      this.constellationData = data.name ? data : null;
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
      }
    }, true);

    this.gesture.enable(true);
    console.log('Swipe gesture enabled for Myth page');
  }

  // Navigate to Constellation page when icon is clicked
  navigateToConstellation() {
    console.log('Back icon clicked, navigating to Constellation page');
    this.router.navigateByUrl('/tabs/constellation', { replaceUrl: true });
  }

  async narrateMyth() {
    const mythToNarrate = this.constellationData?.myth;

    if (!mythToNarrate || mythToNarrate.startsWith('No myth found')) {
      await this.presentErrorAlert('Narration Error', 'Myth text not available to narrate.');
      return;
    }
    console.log(`Narrating myth for: ${this.constellationData?.name}`);
    try {
      await TextToSpeech.speak({
        text: mythToNarrate,
        lang: 'en-US', rate: 1.0, pitch: 1.0, volume: 1.0, category: 'ambient'
      });
      console.log('TTS started successfully on Myth page.');
    } catch (error) {
      console.error('Error starting TTS on Myth page:', error);
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
