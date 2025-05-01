import { Component, OnDestroy, OnInit, AfterViewInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import {
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonButton, IonIcon,
    AlertController,
    Gesture, GestureController
} from '@ionic/angular/standalone';
// import { AstrologyDataService, AstrologyData } from '../services/astrology-data.service';
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
import { AstrologyData } from '../services/astrology-data.service';
import { AstrologyDataService } from '../services/astrology-data.service';


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
    astrologyData: AstrologyData = {
        name: null,
        symbol: null,
        myth: null,
        mythLong: null,
        imagePath: null
    };
    hasValidData: boolean = false;
    private dataSubscription: Subscription | null = null;
    private gesture?: Gesture;

    constructor(
        private astrologyService: AstrologyDataService,
        private alertController: AlertController,
        private router: Router,
        private gestureCtrl: GestureController,
        private cdRef: ChangeDetectorRef
    ) {
        addIcons({ micOutline });
        addIcons({ starOutline, bookOutline, chevronBackOutline, chevronForwardOutline });
    }

    ngOnInit() {
        this.dataSubscription = this.astrologyService.currentAstrologyData.subscribe(async data => {
            console.log('MythPage received data:', data);
            if (data.name && data.symbol) {
                const mythLong = await this.astrologyService.getMythLong(data.symbol);
                this.astrologyData = { ...data, mythLong };
                this.hasValidData = true;
                console.log('MythPage updated with long myth:', this.astrologyData);
                this.cdRef.detectChanges();
            } else {
                this.astrologyData = { name: null, symbol: null, myth: null, mythLong: null, imagePath: null };
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
                    if (detail.deltaX > -100 && Math.abs(detail.deltaY) < 100) {
                        console.log('Swipe left detected on Constellation page');
                        // this.router.navigateByUrl('/tabs/myth', { replaceUrl: true });
                        this.navigateToMyth();
                    }
                    // if (detail.deltaX > 100 && Math.abs(detail.deltaY) < 100) {
                    //     console.log('Swipe right detected on Myth page, navigating to astrology');
                    //     this.navigateToAstrology();
                    // }
                    // else if (detail.deltaX < -100 && Math.abs(detail.deltaY) < 100) {
                    //     console.log('Swipe left detected on Myth page, navigating to Astrology');
                    //     this.navigateToAstrology();
                    // }
                }
            }, true);

            this.gesture.enable(true);
            console.log('Swipe gesture enabled for Myth page (left -> astrology, right -> astrology)');
        } catch (err) {
            console.error('Error setting up swipe gesture on Myth page:', err);
        }
    }
    navigateToMyth() {
        console.log('Navigating to Myths page from Asterology');
        this.router.navigateByUrl('/tabs/myth', { replaceUrl: true });
    }

    async narrateMythShort() {
        if (!this.hasValidData || !this.astrologyData?.myth || this.astrologyData.myth.startsWith('No short myth found')) {
            await this.presentErrorAlert('Narration Error', 'Short myth text not available to narrate.');
            return;
        }
        console.log(`Narrating short myth for: ${this.astrologyData?.name}`);
        await this.speakText(this.astrologyData.myth, 'Short Myth Narration');
    }

    async narrateMythLong() {
        if (!this.hasValidData || !this.astrologyData?.mythLong || this.astrologyData.mythLong.startsWith('No long myth found')) {
            await this.presentErrorAlert('Narration Error', 'Full story text not available to narrate.');
            return;
        }
        console.log(`Narrating full story for: ${this.astrologyData?.name}`);
        await this.speakText(this.astrologyData.mythLong, 'Full Story Narration');
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
