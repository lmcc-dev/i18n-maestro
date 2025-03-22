/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

/**
 * 全局类型声明文件 (Global type declarations)
 */

// React模块声明 (React module declaration)
declare module 'react' {
  // React基本类型定义 (React basic type definitions)
  type ReactNode = string | number | boolean | null | undefined | ReactElement | Array<ReactNode>;
  type FC<Props = unknown> = (props: Props) => ReactElement;
  type ComponentType<_P = unknown> = FC<_P>;
  
  // React hooks (React hooks)
  function useState<T>(initialState: T | (() => T)): [T, (newState: T) => void];
  function useEffect(effect: () => void | (() => void), deps?: ReadonlyArray<unknown>): void;
  function useContext<_T>(context: Context<_T>): _T;
  export function useMemo<_T>(factory: () => _T, deps: unknown[]): _T;
  export function useCallback<_T extends (...args: unknown[]) => unknown>(
    callback: _T, 
    deps: unknown[]
  ): _T;
  
  // React context (React context)
  export function createContext<_T>(defaultValue: _T): React.Context<_T>;
  export interface Context<_T> {
    Provider: unknown;
    Consumer: unknown;
    displayName?: string;
  }
  
  // React元素创建 (React element creation)
  export function createElement(
    type: string | ComponentType<unknown>,
    props?: unknown,
    ...children: ReactNode[]
  ): unknown;
  
  // 其他导出项 (Other exports)
  export const Fragment: unknown;
}