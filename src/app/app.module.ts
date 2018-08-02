import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ErrorHandler, NgModule } from '@angular/core';
import { HttpClientModule} from '@angular/common/http';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';

import { FeathersProvider } from '../providers/feathers/feathers';

@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp, {
      preloadModules: true, // Optimize page modules preloading according to their @IonicPage priority (for faster response to deep links)
      menuType: 'overlay', // 'push' - slide out pushing the page, 'reveal' - slide out pushing the page (iOS), 'overlay' - slide out covering the page (MD and Windows)
      platforms: {
        ios: {
          menuType: 'reveal',
        }
      }
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp
  ],
  providers: [
    SplashScreen,
    StatusBar,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    FeathersProvider
  ]
})
export class AppModule {}
