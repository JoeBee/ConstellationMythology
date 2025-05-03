import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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
  IonFooter,
  IonCardContent,
  IonList,
  IonSelect,
  IonSelectOption,
  IonButtons
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
import { chevronForwardOutline, trashOutline, refreshOutline } from 'ionicons/icons';
import { AstrologyDataService, AstrologyData } from '../services/astrology-data.service';
import { FormsModule } from '@angular/forms';
import { Subscription, BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-constellation',
  templateUrl: 'constellation.page.html',
  styleUrls: ['constellation.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButton, CommonModule, IonIcon, IonItem, IonLabel,
    IonCard, IonCardHeader, IonCardTitle,
    IonFooter, IonCardContent,
    IonList, IonSelect, IonSelectOption,
    FormsModule,
    IonButtons
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ConstellationPage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(IonContent) content!: IonContent;
  @ViewChild('zoomSlides') swiperContainerRef!: ElementRef<HTMLElement>;

  private dataSubscription!: Subscription;

  isTesting: boolean = false; // Added for debugging
  currentLatitude: number | null = null;
  currentLongitude: number | null = null;
  // Removed: currentConstellationName: string | null = 'Unknown';
  // Removed: currentConstellationImage: string | null = null;
  // --- Device Orientation Properties ---
  currentAzimuth: number | null = null; // alpha (0-360)
  currentAltitude: number | null = null; // beta (-180 to 180 or -90 to 90) - Using this as altitude proxy
  private orientationListener: ((event: DeviceOrientationEvent) => void) | null = null;
  private orientationErrorDisplayed = false; // Flag to prevent multiple alerts
  private gesture?: Gesture;

  // Add a subject to track the current pointing constellation
  private pointingConstellationSubject = new BehaviorSubject<string>('Unknown');
  pointingConstellation$ = this.pointingConstellationSubject.asObservable();
  private orientationUpdateTimer: any;
  private isMoving = false;
  private lastAzimuth: number | null = null;
  private lastAltitude: number | null = null;
  private motionCheckTimer: any;
  private motionThreshold = 1.5; // degrees of movement to consider "moving"

  // Dropdown properties
  constellations: Array<{ symbol: string, name: string }> = []; // Changed to object array
  selectedConstellationSymbol: string | null = null; // Renamed for clarity

  // Data properties to hold fetched details (optional, could also just rely on service BehaviorSubjects)
  myth: string | null = null;
  mythLong: string | null = null;
  astrology: string | null = null;
  astrologyLong: string | null = null;

  // Expose the service observable to the template
  constellationData$ = this.constellationService.currentConstellationData;
  astrologyData$ = this.astrologyService.currentAstrologyData;

  constructor(
    private loadingController: LoadingController,
    private alertController: AlertController,
    private constellationService: ConstellationDataService,
    private astrologyService: AstrologyDataService,
    private router: Router,
    private gestureCtrl: GestureController,
    private elementRef: ElementRef
  ) {
    addIcons({ trashOutline, chevronForwardOutline, refreshOutline });
  }

  async ngOnInit() {
    this.startOrientationListener();
    await this.loadConstellationList();
    this.startOrientationUpdates();
  }

  ngAfterViewInit() {
    this.setupSwipeGesture();

    this.dataSubscription = this.constellationData$
      .pipe(
        filter(data => !!data && !!data.imagePath)
      )
      .subscribe(data => {
        console.log('Constellation data updated with image, updating Swiper...');
        setTimeout(() => {
          const swiperEl = this.swiperContainerRef?.nativeElement;
          (swiperEl as any)?.swiper?.update();
          (swiperEl as any)?.swiper?.zoom?.update();
          console.log('Swiper update called.');
        }, 100);
      });
  }

  ngOnDestroy() {
    this.stopOrientationListener();
    this.gesture?.destroy();
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    if (this.orientationUpdateTimer) {
      clearInterval(this.orientationUpdateTimer);
    }
    if (this.motionCheckTimer) {
      clearTimeout(this.motionCheckTimer);
    }
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

          // Check if device is moving
          this.checkDeviceMotion();

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

              // Check if device is moving
              this.checkDeviceMotion();

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
      this.constellationService.updateConstellationData({ name: 'Error: Orientation Unavailable', symbol: '', myth: '', imagePath: null });
      this.astrologyService.updateAstrologyData({ name: 'Error: Orientation Unavailable', symbol: '', astrology: '', imagePath: null });
      return; // Stop execution if orientation is missing
    }

    const loading = await this.loadingController.create({ message: 'Finding constellation...', spinner: 'crescent' });
    await loading.present();
    console.log('Attempting to find constellation...');
    // Reset error flag for next attempt
    this.orientationErrorDisplayed = false;

    // Clear previous data in service
    this.constellationService.clearData();
    this.astrologyService.clearData();

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
      const astrologyText = await this.astrologyService.getAstrology(constellation.symbol);

      // Use constellation name for image path (Refined Logic)
      const imageName = constellation.name.toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/[^a-z0-9-]/g, ''); // Remove other invalid chars
      const imagePath = `assets/constellations/${imageName}-ann.jpg`;
      console.log(`findConstellation derived image path '${imagePath}' from name '${constellation.name}'`);

      // Update shared service
      const data: ConstellationData = {
        name: constellation.name,
        symbol: constellation.symbol,
        myth: mythText,
        imagePath: imagePath
      };

      const dataAstrology: AstrologyData = {
        name: constellation.name,
        symbol: constellation.symbol,
        astrology: astrologyText,
        imagePath: imagePath
      };

      this.constellationService.updateConstellationData(data);
      this.astrologyService.updateAstrologyData(dataAstrology);

    } catch (error) {
      console.error('Error finding constellation:', error);
      // Use the service to potentially show specific error message if needed, or handle it here
      // Example: this.constellationService.updateConstellationData({ name: 'Error: ' + errorMessage, ...initialData });
      // For now, just logging the error might suffice if the template handles null/initial state
      this.presentErrorAlert('Error', `Failed to find constellation: ${error instanceof Error ? error.message : error}`);
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

  async loadConstellationList() {
    try {
      // Use getConstellationList which returns Array<{ symbol: string, name: string }>
      this.constellations = await this.constellationService.getConstellationList();

      console.log('Loaded constellation list (symbol/name):', this.constellations);
      // --- DEBUGGING: Log the received list in component ---
      console.log('[Component] loadConstellationList received:', JSON.stringify(this.constellations.slice(0, 5)) + '...');
      // --- END DEBUGGING ---
    } catch (error) {
      console.error('Error loading constellation list:', error);
      this.presentErrorAlert('Error', 'Could not load constellation list.');
    }
  }

  async onConstellationChange(event: any) {
    const symbol = event.detail.value; // The value is the symbol
    if (!symbol) return;

    console.log(`Constellation selected: ${symbol}`);
    this.selectedConstellationSymbol = symbol;

    // Update the services with the selected constellation's data
    try {
      // Clear previous data if desired, or let update handle it
      // this.constellationService.clearData();
      // this.astrologyService.clearData();

      // Get the full name using the new service method
      const name = await this.constellationService.getConstellationName(symbol);
      // Also get astrology name (might be the same, but use the specific service method)
      const astrologyName = await this.astrologyService.getAstrologySubjectName(symbol);

      // Image path derived from name (or symbol if name lookup fails)
      const imagePath = this.getImagePathFromName(name); // Use helper for image path

      const [mythText, mythLongText, astrologyText, astrologyLongText] = await Promise.all([
        this.constellationService.getMyth(symbol),
        this.constellationService.getMythLong(symbol),
        this.astrologyService.getAstrology(symbol),
        this.astrologyService.getAstrologyLong(symbol)
      ]);

      this.myth = mythText;
      this.mythLong = mythLongText;
      this.astrology = astrologyText;
      this.astrologyLong = astrologyLongText;

      // Update the services using the fetched/looked-up name
      const data: ConstellationData = {
        name: name, // Use looked-up name
        symbol: symbol,
        myth: mythText,
        mythLong: mythLongText,
        imagePath: imagePath // Use derived image path
      };
      const dataAstrology: AstrologyData = {
        name: astrologyName, // Use looked-up name for astrology context
        symbol: symbol,
        astrology: astrologyText,
        astrologyLong: astrologyLongText,
        imagePath: imagePath // Use the same image path
      };

      // --- DEBUGGING: Log data being sent to services ---
      console.log('[Dropdown Change] Updating Constellation Service with:', data);
      console.log('[Dropdown Change] Updating Astrology Service with:', dataAstrology);
      // --- END DEBUGGING ---

      this.constellationService.updateConstellationData(data);
      this.astrologyService.updateAstrologyData(dataAstrology);

    } catch (error) {
      console.error(`Error fetching details for ${symbol}:`, error);
      this.presentErrorAlert('Error', `Could not fetch details for ${symbol}.`);
      // Optionally clear data on error
      this.constellationService.clearData();
      this.astrologyService.clearData();
      this.myth = null;
      this.mythLong = null;
      this.astrology = null;
      this.astrologyLong = null;
    }
  }

  // Helper function to get image path from name (Refined)
  getImagePathFromName(name: string): string {
    // Derive image path
    const imageName = name.toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces directly with hyphens
      .replace(/[^a-z0-9-]/g, ''); // Remove any other non-alphanumeric characters except hyphens
    const imagePath = `assets/constellations/${imageName}-ann.jpg`;
    console.log(`getImagePathFromName derived image path '${imagePath}' from name '${name}'`);
    return imagePath;
  }

  /* // Helper function to get constellation name and image path from symbol (No longer needed directly)
    getConstellationDetailsFromName(symbol: string): { name: string, imagePath: string } {
    // ... (commented out code remains here)
    return { name: name, imagePath: imagePath };
  }
  */

  // Add the clearData method here
  clearData() {
    console.log('Clearing all data...');
    // Reset constellation data (using default/initial state)
    this.constellationService.updateConstellationData({
      name: 'Unknown', // Or null/undefined depending on service logic
      symbol: '',
      myth: '',
      imagePath: null
    });

    // Reset astrology data (using default/initial state)
    this.astrologyService.updateAstrologyData({
      name: 'Unknown', // Or null/undefined
      symbol: '',
      astrology: '',
      imagePath: null
    });

    // Reset the dropdown selection
    this.selectedConstellationSymbol = null;

    // Optionally reset location/orientation if needed
    // this.currentLatitude = null;
    // this.currentLongitude = null;
    // this.currentAzimuth = null;
    // this.currentAltitude = null;

    // Optionally, provide user feedback (e.g., a toast message)
    // this.presentToast('Data cleared successfully.');
  }

  // Add a method to start periodic updates of the pointing constellation
  startOrientationUpdates() {
    // Clear any existing timer
    if (this.orientationUpdateTimer) {
      clearInterval(this.orientationUpdateTimer);
    }

    // Update pointing constellation every 2 seconds
    this.orientationUpdateTimer = setInterval(async () => {
      await this.updatePointingConstellation();
    }, 2000);

    // Initial update
    this.updatePointingConstellation();
  }

  // Method to determine the current constellation without affecting the main UI
  async updatePointingConstellation() {
    // Skip if orientation data is not available
    if (this.currentAzimuth === null || this.currentAltitude === null) {
      this.pointingConstellationSubject.next('Unknown');
      return;
    }

    // Skip update if the device is currently moving
    if (this.isMoving) {
      return;
    }

    try {
      // Get current position
      let position: Position;
      try {
        position = await this.getCurrentPosition();
      } catch (error) {
        console.error('Error getting position for pointing update:', error);
        this.pointingConstellationSubject.next('Location unavailable');
        return;
      }

      const currentTime = new Date();
      const deviceAzimuth = this.currentAzimuth!;
      let deviceAltitude = Math.max(-90, Math.min(90, this.currentAltitude!));

      // This is similar to the findConstellation method but without updating the main constellation data
      // Calculate the celestial coordinates (right ascension and declination)
      const observer = new Astronomy.Observer(position.coords.latitude, position.coords.longitude, 0);
      const horSphere = new Astronomy.Spherical(deviceAltitude, deviceAzimuth, 1);
      const horVector = Astronomy.VectorFromHorizon(horSphere, currentTime, '');
      const rotMatrix = Astronomy.Rotation_HOR_EQJ(currentTime, observer);
      const eqjVector = Astronomy.RotateVector(rotMatrix, horVector);
      const eqCoords = Astronomy.EquatorFromVector(eqjVector);

      // Now find which constellation contains these coordinates
      const constellation = Astronomy.Constellation(eqCoords.ra, eqCoords.dec);

      // Find the constellation name from our list or use the one from astronomy-engine
      const constellationName = constellation.name || 'Unknown';

      // Update the pointing constellation subject
      this.pointingConstellationSubject.next(constellationName);
    } catch (error) {
      console.error('Error updating pointing constellation:', error);
      this.pointingConstellationSubject.next('Error');
    }
  }

  checkDeviceMotion() {
    if (this.currentAzimuth === null || this.currentAltitude === null) {
      return;
    }

    // Initialize last values if not already set
    if (this.lastAzimuth === null || this.lastAltitude === null) {
      this.lastAzimuth = this.currentAzimuth;
      this.lastAltitude = this.currentAltitude;
      return;
    }

    // Calculate the difference in movement
    const azimuthDiff = Math.abs(this.currentAzimuth - this.lastAzimuth);
    const altitudeDiff = Math.abs(this.currentAltitude - this.lastAltitude);

    // If the device has moved more than the threshold, mark as moving
    if (azimuthDiff > this.motionThreshold || altitudeDiff > this.motionThreshold) {
      if (!this.isMoving) {
        this.isMoving = true;
        this.pointingConstellationSubject.next('...seeking');
      }

      // Update last values for next check
      this.lastAzimuth = this.currentAzimuth;
      this.lastAltitude = this.currentAltitude;

      // Start a timer to reset moving state after 1 second of no updates
      if (this.motionCheckTimer) {
        clearTimeout(this.motionCheckTimer);
      }

      this.motionCheckTimer = setTimeout(() => {
        this.isMoving = false;
        // Force an update of the constellation
        this.updatePointingConstellation();
      }, 1000);
    } else {
      // Update last values even when not moving significantly
      this.lastAzimuth = this.currentAzimuth;
      this.lastAltitude = this.currentAltitude;
    }
  }

}
