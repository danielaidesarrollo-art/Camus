
import { User, Patient } from '../types.ts';

// Permission types
export enum Permission {
    VIEW_ALL_PATIENTS = 'VIEW_ALL_PATIENTS',
    VIEW_ASSIGNED_PATIENTS = 'VIEW_ASSIGNED_PATIENTS',
    VIEW_OWN_DATA = 'VIEW_OWN_DATA',
    EDIT_PATIENT = 'EDIT_PATIENT',
    DELETE_PATIENT = 'DELETE_PATIENT',
    CREATE_PATIENT = 'CREATE_PATIENT',
    VIEW_HANDOVER = 'VIEW_HANDOVER',
    CREATE_HANDOVER = 'CREATE_HANDOVER',
    VIEW_MAP = 'VIEW_MAP',
    VIEW_ROUTES = 'VIEW_ROUTES',
    PLAN_ROUTES = 'PLAN_ROUTES',
    VIEW_STAFF = 'VIEW_STAFF',
    MANAGE_STAFF = 'MANAGE_STAFF',
    VIEW_PRODUCTION = 'VIEW_PRODUCTION',
    VIEW_PERSONNEL_PLANNING = 'VIEW_PERSONNEL_PLANNING',
    VIEW_SCHEDULE = 'VIEW_SCHEDULE',
    CONFIRM_APPOINTMENTS = 'CONFIRM_APPOINTMENTS',
    VIEW_SERVICE_TRACKING = 'VIEW_SERVICE_TRACKING'
}

// View types
export enum View {
    DASHBOARD = 'dashboard',
    PATIENT_PORTAL = 'patient_portal',
    HANDOVER = 'handover',
    SCHEDULE = 'schedule',
    PROFILE = 'profile',
    MAP = 'map',
    ROUTES = 'routes',
    STAFF = 'staff',
    PRODUCTION = 'production',
    PERSONNEL = 'personnel'
}

// User types
export type UserType = 'PROFESIONAL' | 'PACIENTE';

// Role-based permissions mapping
const ROLE_PERMISSIONS: Record<string, Permission[]> = {
    // Patient permissions - very limited
    'PACIENTE': [
        Permission.VIEW_OWN_DATA,
        Permission.CONFIRM_APPOINTMENTS,
        Permission.VIEW_SERVICE_TRACKING
    ],

    // Healthcare professionals - can view and create handovers
    'MEDICO DOMICILIARIO': [
        Permission.VIEW_ASSIGNED_PATIENTS,
        Permission.VIEW_HANDOVER,
        Permission.CREATE_HANDOVER,
        Permission.VIEW_MAP,
        Permission.VIEW_ROUTES,
        Permission.VIEW_SCHEDULE
    ],

    'JEFE MEDICO': [
        Permission.VIEW_ALL_PATIENTS,
        Permission.EDIT_PATIENT,
        Permission.CREATE_PATIENT,
        Permission.VIEW_HANDOVER,
        Permission.CREATE_HANDOVER,
        Permission.VIEW_MAP,
        Permission.VIEW_ROUTES,
        Permission.PLAN_ROUTES,
        Permission.VIEW_SCHEDULE,
        Permission.VIEW_PRODUCTION,
        Permission.VIEW_PERSONNEL_PLANNING
    ],

    'ENFERMERO(A) JEFE PAD': [
        Permission.VIEW_ALL_PATIENTS,
        Permission.EDIT_PATIENT,
        Permission.CREATE_PATIENT,
        Permission.VIEW_HANDOVER,
        Permission.CREATE_HANDOVER,
        Permission.VIEW_MAP,
        Permission.VIEW_ROUTES,
        Permission.PLAN_ROUTES,
        Permission.VIEW_SCHEDULE
    ],

    'ENFERMERO(A) JEFE PAD ADMINISTRATIVO': [
        Permission.VIEW_ALL_PATIENTS,
        Permission.EDIT_PATIENT,
        Permission.CREATE_PATIENT,
        Permission.VIEW_HANDOVER,
        Permission.CREATE_HANDOVER,
        Permission.VIEW_MAP,
        Permission.VIEW_ROUTES,
        Permission.PLAN_ROUTES,
        Permission.VIEW_SCHEDULE,
        Permission.VIEW_STAFF,
        Permission.MANAGE_STAFF,
        Permission.VIEW_PRODUCTION,
        Permission.VIEW_PERSONNEL_PLANNING
    ],

    'AUXILIAR DE ENFERMERIA PAD': [
        Permission.VIEW_ASSIGNED_PATIENTS,
        Permission.VIEW_HANDOVER,
        Permission.CREATE_HANDOVER,
        Permission.VIEW_MAP,
        Permission.VIEW_ROUTES,
        Permission.VIEW_SCHEDULE
    ],

    'AUXILIAR DE ENFERMERIA PAD (N)': [
        Permission.VIEW_ASSIGNED_PATIENTS,
        Permission.VIEW_HANDOVER,
        Permission.CREATE_HANDOVER,
        Permission.VIEW_MAP,
        Permission.VIEW_ROUTES,
        Permission.VIEW_SCHEDULE
    ],

    'FISIOTERAPEUTA PAD': [
        Permission.VIEW_ASSIGNED_PATIENTS,
        Permission.VIEW_HANDOVER,
        Permission.CREATE_HANDOVER,
        Permission.VIEW_MAP,
        Permission.VIEW_ROUTES,
        Permission.VIEW_SCHEDULE
    ],

    'FONOAUDIOLOGO (A) PAD': [
        Permission.VIEW_ASSIGNED_PATIENTS,
        Permission.VIEW_HANDOVER,
        Permission.CREATE_HANDOVER,
        Permission.VIEW_MAP,
        Permission.VIEW_ROUTES,
        Permission.VIEW_SCHEDULE
    ],

    'TERAPEUTA OCUPACIONAL PAD': [
        Permission.VIEW_ASSIGNED_PATIENTS,
        Permission.VIEW_HANDOVER,
        Permission.CREATE_HANDOVER,
        Permission.VIEW_MAP,
        Permission.VIEW_ROUTES,
        Permission.VIEW_SCHEDULE
    ],

    'NUTRICIONISTA': [
        Permission.VIEW_ASSIGNED_PATIENTS,
        Permission.VIEW_HANDOVER,
        Permission.CREATE_HANDOVER,
        Permission.VIEW_MAP,
        Permission.VIEW_SCHEDULE
    ],

    'PSICOLOGO (A) CLINICO': [
        Permission.VIEW_ASSIGNED_PATIENTS,
        Permission.VIEW_HANDOVER,
        Permission.CREATE_HANDOVER,
        Permission.VIEW_MAP,
        Permission.VIEW_SCHEDULE
    ],

    'TRABAJADOR (A) SOCIAL DOMICILIARIO': [
        Permission.VIEW_ASSIGNED_PATIENTS,
        Permission.VIEW_HANDOVER,
        Permission.CREATE_HANDOVER,
        Permission.VIEW_MAP,
        Permission.VIEW_SCHEDULE
    ],

    'COORDINADOR (A) OPERATIVO(A) PAD': [
        Permission.VIEW_ALL_PATIENTS,
        Permission.EDIT_PATIENT,
        Permission.DELETE_PATIENT,
        Permission.CREATE_PATIENT,
        Permission.VIEW_HANDOVER,
        Permission.CREATE_HANDOVER,
        Permission.VIEW_MAP,
        Permission.VIEW_ROUTES,
        Permission.PLAN_ROUTES,
        Permission.VIEW_STAFF,
        Permission.MANAGE_STAFF,
        Permission.VIEW_PRODUCTION,
        Permission.VIEW_PERSONNEL_PLANNING,
        Permission.VIEW_SCHEDULE
    ],

    // Administrative roles
    'AUXILIAR ADMINISTRATIVO PAD': [
        Permission.VIEW_ALL_PATIENTS,
        Permission.CREATE_PATIENT,
        Permission.VIEW_SCHEDULE,
        Permission.VIEW_PRODUCTION
    ],

    'AUXILIAR DE SERVICIO AL CLIENTE PAD': [
        Permission.VIEW_ALL_PATIENTS,
        Permission.VIEW_SCHEDULE
    ],

    'APRENDIZ EN ETAPA PRACTICA': [
        Permission.VIEW_ASSIGNED_PATIENTS,
        Permission.VIEW_HANDOVER,
        Permission.VIEW_MAP,
        Permission.VIEW_SCHEDULE
    ]
};

// View access mapping
const ROLE_VIEWS: Record<string, View[]> = {
    'PACIENTE': [
        View.PATIENT_PORTAL,
        View.PROFILE
    ],

    // All professional roles have access to these base views
    'DEFAULT_PROFESSIONAL': [
        View.DASHBOARD,
        View.HANDOVER,
        View.SCHEDULE,
        View.PROFILE,
        View.MAP,
        View.ROUTES
    ],

    // Additional views for coordinators and chiefs
    'CHIEF_COORDINATOR': [
        View.DASHBOARD,
        View.HANDOVER,
        View.SCHEDULE,
        View.PROFILE,
        View.MAP,
        View.ROUTES,
        View.STAFF,
        View.PRODUCTION,
        View.PERSONNEL
    ]
};

/**
 * Check if a user has a specific permission
 */
export const hasPermission = (user: User | null, permission: Permission): boolean => {
    if (!user) return false;

    const userType = (user as any).tipoUsuario || 'PROFESIONAL';

    // Patients use the PACIENTE role
    if (userType === 'PACIENTE') {
        const permissions = ROLE_PERMISSIONS['PACIENTE'] || [];
        return permissions.includes(permission);
    }

    // Professionals use their cargo (role)
    const cargo = user.cargo?.toUpperCase() || '';
    const permissions = ROLE_PERMISSIONS[cargo] || [];

    return permissions.includes(permission);
};

/**
 * Check if a user can access a specific view
 */
export const canAccessView = (user: User | null, view: View): boolean => {
    if (!user) return false;

    const userType = (user as any).tipoUsuario || 'PROFESIONAL';

    // Patients can only access patient portal and profile
    if (userType === 'PACIENTE') {
        const allowedViews = ROLE_VIEWS['PACIENTE'] || [];
        return allowedViews.includes(view);
    }

    // Check if user is chief or coordinator
    const cargo = user.cargo?.toUpperCase() || '';
    const isChiefOrCoord = cargo.includes('JEFE') || cargo.includes('COORDINADOR');

    if (isChiefOrCoord) {
        const allowedViews = ROLE_VIEWS['CHIEF_COORDINATOR'] || [];
        return allowedViews.includes(view);
    }

    // Default professional views
    const allowedViews = ROLE_VIEWS['DEFAULT_PROFESSIONAL'] || [];
    return allowedViews.includes(view);
};

/**
 * Filter patients based on user role and permissions
 */
export const filterPatientsByRole = (user: User | null, patients: Patient[]): Patient[] => {
    if (!user) return [];

    const userType = (user as any).tipoUsuario || 'PROFESIONAL';

    // Patients can only see their own data
    if (userType === 'PACIENTE') {
        const patientId = (user as any).patientId;
        return patients.filter(p => p.id === patientId);
    }

    // Users with VIEW_ALL_PATIENTS permission see everything
    if (hasPermission(user, Permission.VIEW_ALL_PATIENTS)) {
        return patients;
    }

    // Users with VIEW_ASSIGNED_PATIENTS see patients assigned to them
    // For now, we'll return all patients, but in a real system you'd filter by assignment
    if (hasPermission(user, Permission.VIEW_ASSIGNED_PATIENTS)) {
        return patients;
    }

    return [];
};

/**
 * Get user type from user object
 */
export const getUserType = (user: User | null): UserType => {
    if (!user) return 'PROFESIONAL';
    return (user as any).tipoUsuario || 'PROFESIONAL';
};

/**
 * Check if user is a patient
 */
export const isPatient = (user: User | null): boolean => {
    return getUserType(user) === 'PACIENTE';
};

/**
 * Check if user is a professional
 */
export const isProfessional = (user: User | null): boolean => {
    return getUserType(user) === 'PROFESIONAL';
};
