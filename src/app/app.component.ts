import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastRegionComponent } from '@shared/ui/toast';

@Component({
  imports: [RouterOutlet, ToastRegionComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {}
