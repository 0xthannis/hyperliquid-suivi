import { AppState, type AppStateStatus } from 'react-native';

let active = AppState.currentState === 'active';

AppState.addEventListener('change', (state: AppStateStatus) => {
  active = state === 'active';
});

/** true quand l'app est ouverte au premier plan */
export function isAppInForeground(): boolean {
  return active;
}
