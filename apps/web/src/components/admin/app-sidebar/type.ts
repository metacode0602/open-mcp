export type IAppSidebarNavItem = {
  title: string;
  url: string;
  icon: React.ReactNode;
  badge?: string;
  isActive?: (currentPathname: string) => boolean;
};
