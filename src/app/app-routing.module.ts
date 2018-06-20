import { NgModule } from '@angular/core';
import { InfoComponent } from './info/info.component';
import { RecommenderComponent} from './recommender/recommender.component';
import { ContentVideoComponent} from './content-video/content-video.component';
import {Routes, RouterModule} from '@angular/router';

// definisce le route, ovvero quale view mostrare(component) quando l'utente interagisce con l'URL specificato da path
// quando serviremo l'app dal nostro server dovremo assicurarci che il path sia giusto (adesso gira su localhost:4200/path)

export const routerConfig: Routes = [
  { path: 'info', component: InfoComponent},
  { path: 'recommender', component: RecommenderComponent},
  { path: 'content-video', component: ContentVideoComponent},
  { path: '', redirectTo: '/', pathMatch: 'full' } // path di default
];

@NgModule({
  imports: [ RouterModule.forRoot(routerConfig) ], // inizializza il router e lo pone in ascolto di cambiamenti della browser location
  exports: [RouterModule]
})
export class AppRoutingModule { }
