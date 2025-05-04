import { Component, OnDestroy, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import {
    AlertController,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonButton, IonIcon,
    Gesture, GestureController
} from '@ionic/angular/standalone';
// import { ConstellationDataService, ConstellationData } from '../services/constellation-data.service';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { triangle, ellipse, square, starOutline, bookOutline } from 'ionicons/icons';
import { chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
// import { IonTabs, IonTabBar, IonTabButton, IonLabel } from '@ionic/angular/standalone';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AstrologyDataService, AstrologyData } from '../services/astrology-data.service';
import { Subscription } from 'rxjs';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

@Component({
    selector: 'app-astrology',
    templateUrl: 'astrology.page.html',
    styleUrls: ['astrology.page.scss'],
    standalone: true,
    imports: [

        IonHeader, IonToolbar, IonTitle, IonContent,
        IonCard, IonCardHeader, IonCardTitle, IonCardContent, CommonModule,
        IonButton, IonIcon,
        IonicModule
    ],
})
export class AstrologyPage implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild(IonContent) content!: IonContent;
    hasValidData: boolean = false;
    currentAstrologyLong: string | null = null;
    private dataSubscription: Subscription | null = null;
    private gesture?: Gesture;

    astrologyData$ = this.astrologyService.currentAstrologyData;


    constructor(
        // private constellationService: ConstellationDataService,
        private astrologyService: AstrologyDataService,
        private alertController: AlertController,

        private router: Router,
        private gestureCtrl: GestureController
    ) {
        addIcons({ starOutline, bookOutline, chevronBackOutline, chevronForwardOutline });
    }

    ngOnInit() {
        this.dataSubscription = this.astrologyService.currentAstrologyData.subscribe(async data => {
            console.log('AstrologyPage received data:', data);
            if (data.name && data.symbol) {
                this.currentAstrologyLong = await this.astrologyService.getAstrologyLong(data.symbol);
                this.hasValidData = true;
                console.log('astrology Page updated. HasValidData=true, Longastrology fetched.');
            } else {
                this.currentAstrologyLong = null;
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
        try {
            const contentEl = await this.content.getScrollElement();
            this.gesture = this.gestureCtrl.create({
                el: contentEl,
                gestureName: 'swipe-astrology',
                direction: 'x',
                threshold: 15,
                onEnd: (detail) => {
                    if (detail.deltaX > 100 && Math.abs(detail.deltaY) < 100) {
                        console.log('Swipe right detected on Astrology page -> Myth');
                        this.navigateToMyth();
                    } else if (detail.deltaX < -100 && Math.abs(detail.deltaY) < 100) {
                        console.log('Swipe left detected on Astrology page -> Heavenly Guidance');
                        this.navigateToHeavenlyGuidance();
                    }
                }
            }, true);

            this.gesture.enable(true);
            console.log('Swipe gesture enabled for Astrology page (right -> Myth, left -> Heavenly Guidance)');
        } catch (err) {
            console.error('Error setting up swipe gesture on Astrology page:', err);
        }
    }

    navigateToMyth() {
        console.log('Navigating to Myth page from Astrology');
        this.router.navigateByUrl('/tabs/myth', { replaceUrl: true });
    }

    navigateToHeavenlyGuidance() {
        console.log('Navigating to Heavenly Guidance page from Astrology');
        this.router.navigateByUrl('/tabs/heavenly-guidance', { replaceUrl: true });
    }

    // ---



    async narrateAstrologyShort() {
        const currentData = this.astrologyService.getCurrentData();
        if (!currentData?.astrology || currentData.astrology.startsWith('No short Astrology found')) {
            await this.presentErrorAlert('Narration Error', 'Short Astrology text not available to narrate.');
            return;
        }
        console.log(`Narrating short Astrology for: ${currentData.name}`);
        await this.speakText(currentData.astrology, 'Short Astrology Narration');
    }

    async narrateAstrologyLong() {
        const currentData = this.astrologyService.getCurrentData();
        if (!this.currentAstrologyLong || this.currentAstrologyLong.startsWith('No long Astrology found')) {
            await this.presentErrorAlert('Narration Error', 'Full story text not available to narrate.');
            return;
        }
        console.log(`Narrating full story for: ${currentData?.name}`);
        await this.speakText(this.currentAstrologyLong, 'Full Story Narration');
    }

    stopReading() {
        TextToSpeech.stop();
    }

    private async speakText(text: string, logContext: string) {
        try {
            await TextToSpeech.speak({
                text: text,
                lang: 'en-US', rate: 1.0, pitch: 1.0, volume: 1.0, category: 'ambient'
            });
            console.log(`TTS started successfully for ${logContext} on Astrology page.`);
        } catch (error) {
            console.error(`Error starting TTS for ${logContext} on Astrology page:`, error);
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
