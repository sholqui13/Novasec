import { Injectable } from '@angular/core';
import type { Case } from '../models';
import type { CasesApi } from './cases.api';

export const FAKE_CASES_DELAY = 600;
// Para ver el estado de error: localStorage.setItem('nvs.fakeCasesError', '1') y recargar.
export const FAKE_CASES_ERROR_KEY = 'nvs.fakeCasesError';

export const FAKE_CASES: readonly Case[] = [
  {
    id: 'c-1042',
    number: 1042,
    title: 'Unauthorized access attempt — Server Room B',
    category: 'Incidente de acceso',
    description:
      'Se detectó un intento de acceso no autorizado en la puerta de Server Room B. La misma credencial fue rechazada tres veces durante un intervalo de 46 segundos. El control de acceso mantuvo la puerta bloqueada y generó el caso automáticamente para revisión del equipo de seguridad.',
    notice: {
      title: 'Validación de credenciales',
      message: 'La validación de credenciales permanece en curso. No se registró apertura de la puerta.',
    },
    status: 'in-progress',
    priority: 'high',
    location: 'Building C — Floor 3',
    reportedAt: '2026-09-26T03:14:00',
    assignee: { id: 'u-001', name: 'María Álvarez', initials: 'MÁ' },
    mapPosition: { x: 53, y: 39 },
  },
  {
    id: 'c-1041',
    number: 1041,
    title: 'Perimeter fence breach — North gate',
    category: 'Intrusión perimetral',
    description:
      'El sensor de vibración de la reja norte reportó contacto a la 01:52. La patrulla confirmó daños cerca de la puerta N-3.',
    status: 'resolved',
    priority: 'low',
    location: 'North Perimeter',
    reportedAt: '2026-09-25T01:52:00',
    assignee: { id: 'u-003', name: 'Carlos Rojas', initials: 'CR' },
  },
  {
    id: 'c-1038',
    number: 1038,
    title: 'Suspicious vehicle — Parking D',
    category: 'Vehículo sospechoso',
    description:
      'Vehículo no registrado estacionado por más de 6 horas en una zona restringida. La placa no aparece en el registro de visitantes.',
    status: 'urgent',
    priority: 'medium',
    location: 'Parking D',
    reportedAt: '2026-09-24T22:05:00',
    assignee: { id: 'u-004', name: 'Ana Torres', initials: 'AT' },
    mapPosition: { x: 68, y: 24 },
  },
  {
    id: 'c-1043',
    number: 1043,
    title: 'Camera offline — Loading dock',
    category: 'Falla de equipo',
    description:
      'La cámara CAM-07 del muelle de carga dejó de transmitir a las 05:40. Se requiere revisión técnica en sitio.',
    status: 'open',
    priority: 'medium',
    location: 'Building A — Loading dock',
    reportedAt: '2026-09-26T05:40:00',
    mapPosition: { x: 28, y: 66 },
  },
  {
    id: 'c-1036',
    number: 1036,
    title: 'Fire alarm test — Building B',
    category: 'Mantenimiento',
    description: 'Prueba programada del sistema de alarma contra incendios completada sin incidentes.',
    status: 'closed',
    priority: 'low',
    location: 'Building B',
    reportedAt: '2026-09-22T10:00:00',
    assignee: { id: 'u-002', name: 'Juan Pérez', initials: 'JP' },
  },
];

@Injectable({ providedIn: 'root' })
export class FakeCasesApi implements CasesApi {
  async getCases(): Promise<readonly Case[]> {
    await new Promise((resolve) => setTimeout(resolve, FAKE_CASES_DELAY));
    if (globalThis.localStorage?.getItem(FAKE_CASES_ERROR_KEY)) {
      throw new Error('Simulated connection error');
    }
    return FAKE_CASES;
  }
}
