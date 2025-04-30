import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  LoadingController,
  AlertController,
  IonItem,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  GestureController,
  Gesture,
  IonFooter
} from '@ionic/angular/standalone';
import { Geolocation, Position } from '@capacitor/geolocation';
import { CommonModule } from '@angular/common';
// Import astronomy-engine functions
import * as Astronomy from 'astronomy-engine';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
// Import the service
import { ConstellationDataService, ConstellationData } from '../services/constellation-data.service';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { chevronForwardOutline } from 'ionicons/icons';

@Component({
  selector: 'app-constellation',
  templateUrl: 'constellation.page.html',
  styleUrls: ['constellation.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButton, CommonModule, IonIcon, IonItem, IonLabel,
    IonCard, IonCardHeader, IonCardTitle,
    IonFooter
  ]
})
export class ConstellationPage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(IonContent) content!: IonContent;
  currentLatitude: number | null = null;
  currentLongitude: number | null = null;
  currentConstellationName: string | null = 'Unknown';
  currentConstellationImage: string | null = null;
  // --- Device Orientation Properties ---
  currentAzimuth: number | null = null; // alpha (0-360)
  currentAltitude: number | null = null; // beta (-180 to 180 or -90 to 90) - Using this as altitude proxy
  private orientationListener: ((event: DeviceOrientationEvent) => void) | null = null;
  private orientationErrorDisplayed = false; // Flag to prevent multiple alerts
  private gesture?: Gesture;

  constructor(
    private loadingController: LoadingController,
    private alertController: AlertController,
    private constellationService: ConstellationDataService,
    private router: Router,
    private gestureCtrl: GestureController,
    private elementRef: ElementRef
  ) {
    addIcons({ chevronForwardOutline });
  }

  ngOnInit() {
    this.startOrientationListener();
  }

  ngAfterViewInit() {
    this.setupSwipeGesture();
  }

  ngOnDestroy() {
    this.stopOrientationListener();
    this.gesture?.destroy();
  }

  startOrientationListener() {
    if (typeof DeviceOrientationEvent === 'undefined' || typeof (DeviceOrientationEvent as any).requestPermission !== 'function') {
      // Standard web API approach if requestPermission is not available (typical for Android/non-iOS 13+)
      if (!('DeviceOrientationEvent' in window)) {
        if (!this.orientationErrorDisplayed) {
          this.presentErrorAlert('Orientation Error', 'Device orientation not supported on this device or browser.');
          this.orientationErrorDisplayed = true;
        }
        return;
      }

      this.orientationListener = (event: DeviceOrientationEvent) => {
        // Use 'deviceorientationabsolute' if available, otherwise fallback to 'deviceorientation'
        // Check for absolute to ensure it's relative to Earth's coordinate system
        if (event.absolute === true || event.absolute === null) { // Treat null as potentially absolute
          this.currentAzimuth = event.alpha;
          this.currentAltitude = event.beta; // Using beta as altitude proxy
          // Optional: Add console logging to debug values
          // console.log(`Orientation - Alpha: ${event.alpha?.toFixed(2)}, Beta: ${event.beta?.toFixed(2)}, Gamma: ${event.gamma?.toFixed(2)}`);
        } else {
          console.warn('Received non-absolute orientation event. Ignoring.');
          // Optionally alert user if only non-absolute is available
          // if (!this.orientationErrorDisplayed) {
          //  this.presentErrorAlert('Orientation Warning', 'Could not get absolute device orientation. Pointing may be inaccurate.');
          //  this.orientationErrorDisplayed = true;
          //}
        }
      };
      // Prefer 'deviceorientationabsolute' but fallback to 'deviceorientation'
      const eventName = ('ondeviceorientationabsolute' in window) ? 'deviceorientationabsolute' : 'deviceorientation';
      window.addEventListener(eventName, this.orientationListener, true);
      console.log(`Listening for ${eventName} events.`);

    } else {
      // iOS 13+ requires permission request
      (DeviceOrientationEvent as any).requestPermission()
        .then((response: string) => {
          if (response === 'granted') {
            this.orientationListener = (event: DeviceOrientationEvent) => {
              this.currentAzimuth = event.alpha;
              this.currentAltitude = event.beta;
              // console.log(`iOS Orientation - Alpha: ${event.alpha?.toFixed(2)}, Beta: ${event.beta?.toFixed(2)}, Gamma: ${event.gamma?.toFixed(2)}`);
            };
            // On iOS, 'deviceorientation' is typically absolute
            window.addEventListener('deviceorientation', this.orientationListener, true);
            console.log(`Listening for deviceorientation events after iOS permission grant.`);
          } else {
            if (!this.orientationErrorDisplayed) {
              this.presentErrorAlert('Orientation Error', 'Permission denied for device orientation.');
              this.orientationErrorDisplayed = true;
            }
          }
        })
        .catch((error: any) => {
          console.error('Error requesting device orientation permission:', error);
          if (!this.orientationErrorDisplayed) {
            this.presentErrorAlert('Orientation Error', 'Could not request device orientation permission.');
            this.orientationErrorDisplayed = true;
          }
        });
    }
  }

  stopOrientationListener() {
    if (this.orientationListener) {
      // Ensure we remove the correct listener based on which one was added
      const eventName = ('ondeviceorientationabsolute' in window) ? 'deviceorientationabsolute' : 'deviceorientation';
      window.removeEventListener(eventName, this.orientationListener, true);
      // Also remove the base one in case iOS logic was used
      window.removeEventListener('deviceorientation', this.orientationListener, true);
      this.orientationListener = null;
      console.log('Stopped listening for device orientation events.');
    }
  }

  async findConstellation() {
    // Check if orientation data is available
    if (this.currentAzimuth === null || this.currentAltitude === null) {
      if (!this.orientationErrorDisplayed) {
        this.presentErrorAlert('Orientation Error', 'Device orientation data not available. Cannot determine direction.');
        // We might still proceed using default/placeholder values or just return
        // For now, let's alert and return to avoid using placeholders unknowingly.
        this.orientationErrorDisplayed = true; // Prevent repeated alerts
      }
      // Optionally set a specific error state for the UI instead of 'Unknown'
      this.currentConstellationName = 'Error: Orientation Unavailable';
      this.currentConstellationImage = null;
      this.constellationService.clearData(); // Clear service data as well
      return; // Stop execution if orientation is missing
    }

    const loading = await this.loadingController.create({ message: 'Finding constellation...', spinner: 'crescent' });
    await loading.present();
    console.log('Attempting to find constellation...');
    // Reset error flag for next attempt
    this.orientationErrorDisplayed = false;

    // Clear previous data in service
    this.constellationService.clearData();
    // Reset local state for UI feedback
    this.currentConstellationName = 'Unknown';
    this.currentConstellationImage = null;

    try {
      const position = await this.getCurrentPosition();
      this.currentLatitude = position.coords.latitude;
      this.currentLongitude = position.coords.longitude;

      const currentTime = new Date();
      // --- Use real orientation data ---
      const deviceAzimuth = this.currentAzimuth!; // Use the stored azimuth
      let deviceAltitude = this.currentAltitude!; // Use the stored altitude (beta)

      // --- Adjust Altitude (Beta) ---
      // Beta range is typically -180 to 180 or -90 to 90.
      // Assuming -90 (down) to 90 (up) for simplicity.
      // If beta is 90, altitude is 90 (zenith).
      // If beta is 0, altitude is 0 (horizon).
      // If beta is -90, altitude is -90 (nadir).
      // The astronomy engine expects altitude from -90 to +90.
      // Let's clamp beta to [-90, 90] just in case the range is different.
      deviceAltitude = Math.max(-90, Math.min(90, deviceAltitude));

      console.log(`Using Azimuth: ${deviceAzimuth.toFixed(2)}, Altitude (Beta): ${deviceAltitude.toFixed(2)}`);

      const observer = new Astronomy.Observer(this.currentLatitude!, this.currentLongitude!, 0);
      // Use calculated altitude and azimuth
      const horSphere = new Astronomy.Spherical(deviceAltitude, deviceAzimuth, 1);
      const horVector = Astronomy.VectorFromHorizon(horSphere, currentTime, ''); // Removed observer - VectorFromHorizon doesn't take it
      const rotMatrix = Astronomy.Rotation_HOR_EQJ(currentTime, observer);
      const eqjVector = Astronomy.RotateVector(rotMatrix, horVector);
      const eqCoords = Astronomy.EquatorFromVector(eqjVector);
      const constellation = Astronomy.Constellation(eqCoords.ra, eqCoords.dec);
      console.log('Detected Constellation:', constellation);

      // Fetch the myth asynchronously from the service
      const mythText = await this.constellationService.getMyth(constellation.symbol);

      // Use constellation name for image path
      let imageName = constellation.name.toLowerCase().replace(/\s+/g, '_'); // Ensure lowercase, replace spaces with underscores
      imageName = imageName.replace('_', '-');
      const imagePath = `assets/constellations/${imageName}-ann.jpg`;

      // Update local state for immediate UI feedback
      this.currentConstellationName = constellation.name;
      this.currentConstellationImage = imagePath;

      // Update shared service
      const data: ConstellationData = {
        name: constellation.name,
        symbol: constellation.symbol,
        myth: mythText,
        imagePath: imagePath
      };
      this.constellationService.updateConstellationData(data);

    } catch (error) {
      console.error('Error finding constellation:', error);
      // Update local state
      // Keep specific error if it's orientation related, otherwise generic
      if (this.currentConstellationName !== 'Error: Orientation Unavailable') {
        this.currentConstellationName = 'Error finding constellation';
      }
      this.currentConstellationImage = null;
      // Clear service data on error
      this.constellationService.clearData();

      let errorMessage = 'An unknown error occurred.';
      if (error instanceof Error) { errorMessage = error.message; }
      // Avoid showing redundant alerts if orientation failed
      if (this.currentConstellationName !== 'Error: Orientation Unavailable') {
        await this.presentErrorAlert('Constellation Error', errorMessage);
      }
    } finally {
      await loading.dismiss();
    }
  }

  async getCurrentPosition(): Promise<Position> {
    try {
      const permissions = await Geolocation.checkPermissions();
      console.log('Geolocation permissions:', permissions);

      if (permissions.location !== 'granted' && permissions.coarseLocation !== 'granted') {
        const newPermissions = await Geolocation.requestPermissions();
        console.log('New Geolocation permissions:', newPermissions);
        if (newPermissions.location !== 'granted' && newPermissions.coarseLocation !== 'granted') {
          throw new Error('Location permission denied. Please enable location services in settings.');
        }
      }
      // Get the current position
      // High accuracy is useful for astronomy
      return await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
    } catch (error) {
      console.error('Error getting current position:', error);
      let errorMessage = 'Could not retrieve location.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      // Re-throw or present alert here? Let's present alert and throw a generic error
      // so the calling function (findConstellation) also knows an error occurred.
      await this.presentErrorAlert('Location Error', errorMessage);
      throw new Error('Failed to get location'); // Let findConstellation handle UI state
    }
  }

  async narrateMythShort() {
    // Get current data from the service
    const currentData = this.constellationService.getCurrentData();
    // Myth should already be loaded into the service's current data by findConstellation
    const mythToNarrate = currentData.myth;

    if (!mythToNarrate || mythToNarrate.startsWith('No myth found')) {
      await this.presentErrorAlert('Narration Error', 'Myth text not available to narrate.');
      return;
    }
    console.log(`Narrating myth for: ${currentData.name}`);
    try {
      await TextToSpeech.speak({
        text: mythToNarrate,
        lang: 'en-US', rate: 1.0, pitch: 1.0, volume: 1.0, category: 'ambient'
      });
      console.log('TTS started successfully.');
    } catch (error) {
      console.error('Error starting TTS:', error);
      let errorMessage = 'Could not start text-to-speech.';
      if (error instanceof Error) { errorMessage = error.message; }
      await this.presentErrorAlert('TTS Error', errorMessage);
    }
  }

  // Helper method to present error alerts
  async presentErrorAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  async setupSwipeGesture() {
    const contentEl = await this.content.getScrollElement();
    this.gesture = this.gestureCtrl.create({
      el: contentEl,
      gestureName: 'swipe-left',
      direction: 'x',
      threshold: 15,
      onEnd: (detail) => {
        if (detail.deltaX < -100 && Math.abs(detail.deltaY) < 100) {
          console.log('Swipe left detected on Constellation page');
          this.router.navigateByUrl('/tabs/myth', { replaceUrl: true });
        }
      }
    }, true);

    this.gesture.enable(true);
    console.log('Swipe gesture enabled for Constellation page');
  }

  // Navigate to Myth page when icon is clicked
  navigateToMyth() {
    console.log('Forward icon clicked, navigating to Myth page');
    this.router.navigateByUrl('/tabs/myth', { replaceUrl: true });
  }
}
