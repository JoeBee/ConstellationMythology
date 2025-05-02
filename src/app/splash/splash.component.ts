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
        // Hide the splash screen after 3 seconds
        setTimeout(() => {
            // Create fade-out animation
            const fadeAnimation = this.animationCtrl.create()
                .addElement(document.querySelector('.splash-container')!)
                .duration(800)
                .fromTo('opacity', '1', '0');

            // Play the animation
            fadeAnimation.play().then(() => {
                this.showSplash = false;
            });
        }, 3000);
    }
} 