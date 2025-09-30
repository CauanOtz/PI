// Lightweight mock for @radix-ui/react-dropdown-menu to silence act warnings in tests.
// Provides basic structural components that just render children without portals, poppers or side effects.
import React from 'react';

interface BasicProps { children?: React.ReactNode; className?: string; onClick?: any; align?: string; sideOffset?: number; }
const Root: React.FC<BasicProps> = ({ children }) => <div data-mock="DropdownRoot">{children}</div>;
const Trigger: React.FC<BasicProps & { asChild?: boolean }> = ({ children, asChild, ...rest }) => asChild ? <>{children}</> : <button {...rest}>{children}</button>;
const Portal: React.FC<BasicProps> = ({ children }) => <>{children}</>;
const Content: React.FC<BasicProps> = ({ children, ...rest }) => <div data-mock="DropdownContent" {...rest}>{children}</div>;
const Item: React.FC<BasicProps> = ({ children, ...rest }) => <div role="menuitem" tabIndex={0} {...rest}>{children}</div>;
const Separator: React.FC = () => <hr />;

export const DropdownMenuMock = { Root, Trigger, Portal, Content, Item, Separator };

export default DropdownMenuMock;