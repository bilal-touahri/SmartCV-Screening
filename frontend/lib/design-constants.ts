// Design system constants for SmartCV
export const COLORS = {
  primary: '#0D3349', // Dark petrol blue
  accent: '#FF6B6B', // Coral
  background: '#F8FAFC', // Light gray
  secondaryText: '#4B5563', // Secondary text
  success: '#22c55e', // Green
  warning: '#f59e0b', // Orange
  danger: '#ef4444', // Red
  white: '#FFFFFF',
  dark: '#1F2937',
  lightGray: '#E5E7EB',
  darkGray: '#6B7280',
};

export const SIDEBAR_ROUTES = {
  candidat: [
    { label: 'Tableau de bord', icon: 'LayoutGrid', href: '/candidat/dashboard' },
    { label: 'Offres d\'emploi', icon: 'Briefcase', href: '/candidat/offres' },
    { label: 'Mes candidatures', icon: 'FileText', href: '/candidat/candidatures' },
    { label: 'Mon profil', icon: 'User', href: '/candidat/profil' },
  ],
  recruteur: [
    { label: 'Tableau de bord', icon: 'LayoutGrid', href: '/recruteur/dashboard' },
    { label: 'Gestion des offres', icon: 'Briefcase', href: '/recruteur/gestion-offres' },
    { label: 'Mon profil', icon: 'User', href: '/recruteur/profil' },
  ],
  admin: [
    { label: 'Tableau de bord', icon: 'LayoutGrid', href: '/admin/dashboard' },
    { label: 'Utilisateurs', icon: 'Users', href: '/admin/utilisateurs' },
    { label: 'Offres', icon: 'Briefcase', href: '/admin/offres' },
    { label: 'Candidatures', icon: 'FileText', href: '/admin/candidatures' },
    { label: 'Statistiques', icon: 'BarChart3', href: '/admin/statistiques' },
  ],
};
