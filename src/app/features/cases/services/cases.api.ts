import { Injectable } from '@angular/core';
import type { Case } from '../models';
import { FakeCasesApi } from './fake-cases.api';

// Para conectar un backend real, cambia `useClass` por una implementación HTTP.
@Injectable({ providedIn: 'root', useClass: FakeCasesApi })
export abstract class CasesApi {
  abstract getCases(): Promise<readonly Case[]>;
}
