import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimationController } from '@ionic/angular/standalone';
import { IonContent, IonImg } from '@ionic/angular/standalone';

@Component({
    selector: 'app-splash',
    templateUrl: './splash.component.html',
    styleUrls: ['./splash.component.scss'],
    standalone: true,
    imports: [CommonModule, IonContent, IonImg]
})
export class SplashComponent implements OnInit {
    showSplash = true;

    constructor(private animationCtrl: AnimationController) { }

    ngOnInit() {
        // First fade out the text after 3 seconds
        setTimeout(() => {
            // Create text fade-out animation
            const textFadeAnimation = this.animationCtrl.create()
                .addElement(document.querySelector('.text-overlay')!)
                .duration(800)
                .fromTo('opacity', '1', '0');

            // Play the text animation
            textFadeAnimation.play();
        }, 3000);

        // Hide the splash screen after 5 seconds
        setTimeout(() => {
            // Create fade-out animation for the whole splash
            const splashFadeAnimation = this.animationCtrl.create()
                .addElement(document.querySelector('.splash-container')!)
                .duration(800)
                .fromTo('opacity', '1', '0');

            // Play the animation
            splashFadeAnimation.play().then(() => {
                this.showSplash = false;
            });
        }, 5000);
    }
} 