import { vi } from "vitest";
export const push = vi.fn();
export const useRouter = () => ({ push, replace: vi.fn(), back: vi.fn(), refresh: vi.fn() });
export const usePathname = () => "/admin/projects";