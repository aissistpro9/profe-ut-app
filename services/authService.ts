// ============================================================================
// AUTHENTICATION & ACCESS CONTROL SERVICE — EL PROFE UT
// ============================================================================

export interface UserAccount {
  username: string;
  name: string;
  role: 'student' | 'vip' | 'admin';
  plan: string;
  expiresAt: string; // ISO date
  salt: string;
  passwordHash: string; // SHA-256 hash of (salt + password)
}

export interface UserSession {
  username: string;
  name: string;
  role: 'student' | 'vip' | 'admin';
  plan: string;
  token: string;
  loginTime: number;
}

// SHA-256 Helper using Web Crypto API
async function sha256(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Pre-computed SHA-256 hashes for the 5 initial user credentials:
// 1. alumno1_ut    / Ut2026!Alfa
// 2. alumno2_ut    / Ut2026!Beta
// 3. alumno3_ut    / Ut2026!Gamma
// 4. tester_vip    / VipProfe#99
// 5. admin_smith   / SmithUt$2026

const AUTHORIZED_USERS: UserAccount[] = [
  {
    username: 'alumno1_ut',
    name: 'Estudiante UT - Alfa',
    role: 'student',
    plan: 'Plan Mensual Universitario',
    expiresAt: '2026-12-31T23:59:59Z',
    salt: 'salt_ut_alfa_2026',
    passwordHash: '3b17d95b96de8d9b95b12e499ccbdd26ae7ca5763dbe9f54d103ddf4797a15f4'
  },
  {
    username: 'alumno2_ut',
    name: 'Estudiante UT - Beta',
    role: 'student',
    plan: 'Plan Mensual Universitario',
    expiresAt: '2026-12-31T23:59:59Z',
    salt: 'salt_ut_beta_2026',
    passwordHash: 'ea8c92b5dc0e57de5964478af4191b00daabc857c657f36476fb1ddb27b47438'
  },
  {
    username: 'alumno3_ut',
    name: 'Estudiante UT - Gamma',
    role: 'student',
    plan: 'Plan Mensual Universitario',
    expiresAt: '2026-12-31T23:59:59Z',
    salt: 'salt_ut_gamma_2026',
    passwordHash: '77f7a2c67d64eb10fc12b584c551ae8202179621fff0fe97233b848969a06ecd'
  },
  {
    username: 'tester_vip',
    name: 'Evaluador VIP / Tester',
    role: 'vip',
    plan: 'Plan Semestral VIP',
    expiresAt: '2026-12-31T23:59:59Z',
    salt: 'salt_vip_test_2026',
    passwordHash: 'd62effefb70f7974e3ef7ada76fa848d216b2c6ef040386bd264df17d8a22c58'
  },
  {
    username: 'admin_smith',
    name: 'Smith Córdoba (Admin)',
    role: 'admin',
    plan: 'Acceso Total Vitalicio',
    expiresAt: '2030-12-31T23:59:59Z',
    salt: 'salt_admin_smith_2026',
    passwordHash: '916bd908c52e613b9ce455307b88ac00aeab46a4208199203ebfe68537ad8eae'
  }
];

const SESSION_STORAGE_KEY = 'profe_ut_auth_session';

class AuthService {
  private currentSession: UserSession | null = null;

  constructor() {
    this.restoreSession();
  }

  private restoreSession(): void {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY) || sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        const session: UserSession = JSON.parse(stored);
        // Sessions expire after 14 days
        const MAX_SESSION_MS = 14 * 24 * 60 * 60 * 1000;
        if (Date.now() - session.loginTime < MAX_SESSION_MS) {
          this.currentSession = session;
        } else {
          this.logout();
        }
      }
    } catch {
      this.currentSession = null;
    }
  }

  public async login(usernameInput: string, passwordInput: string, rememberMe = true): Promise<{ success: boolean; message?: string; session?: UserSession }> {
    const cleanUsername = usernameInput.trim().toLowerCase();
    const cleanPassword = passwordInput.trim();

    if (!cleanUsername || !cleanPassword) {
      return { success: false, message: 'Por favor ingresa usuario y contraseña.' };
    }

    const account = AUTHORIZED_USERS.find(u => u.username.toLowerCase() === cleanUsername);
    if (!account) {
      return { success: false, message: 'Usuario no encontrado o clave incorrecta.' };
    }

    // Check expiration
    if (new Date(account.expiresAt).getTime() < Date.now()) {
      return { success: false, message: 'Tu suscripción ha expirado. Contacta a soporte para renovarla.' };
    }

    // Verify hash
    const inputHash = await sha256(account.salt + cleanPassword);
    if (inputHash !== account.passwordHash) {
      return { success: false, message: 'Contraseña incorrecta. Verifica e intenta nuevamente.' };
    }

    // Generate secure token
    const token = await sha256(`${account.username}_${Date.now()}_${Math.random()}`);
    const session: UserSession = {
      username: account.username,
      name: account.name,
      role: account.role,
      plan: account.plan,
      token,
      loginTime: Date.now()
    };

    this.currentSession = session;
    const sessionString = JSON.stringify(session);
    if (rememberMe) {
      localStorage.setItem(SESSION_STORAGE_KEY, sessionString);
    } else {
      sessionStorage.setItem(SESSION_STORAGE_KEY, sessionString);
    }

    return { success: true, session };
  }

  public logout(): void {
    this.currentSession = null;
    localStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  }

  public isAuthenticated(): boolean {
    return this.currentSession !== null;
  }

  public getSession(): UserSession | null {
    return this.currentSession;
  }
}

export const authService = new AuthService();
