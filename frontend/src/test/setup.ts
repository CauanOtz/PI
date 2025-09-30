import React from 'react';
import { vi } from 'vitest';

const make = (tag = 'div') => {
  return function MockComp(props: any) {
    const { children, ...rest } = props || {};
    return React.createElement(tag, { 'data-radix-mock': true, ...rest }, children);
  };
};

function simpleReturn(children: any) { return children; }

vi.mock('@radix-ui/react-dropdown-menu', () => {
  const Root = make('div');
  const Trigger = (props: any) => props.asChild ? simpleReturn(props.children) : React.createElement('button', props, props.children);
  const Portal = (props: any) => simpleReturn(props.children);
  const Content = make('div');
  const Item = (props: any) => React.createElement('div', { role: 'menuitem', tabIndex: 0, ...props }, props.children);
  const Separator = () => React.createElement('hr');
  return { __esModule: true, Root, Trigger, Portal, Content, Item, Separator };
});

vi.mock('@radix-ui/react-menu', () => ({ __esModule: true, Root: make('div'), Trigger: make('button'), Portal: (p:any)=> p.children, Content: make('div'), Item: make('div'), Separator: () => React.createElement('hr') }));
vi.mock('@radix-ui/react-popper', () => ({ __esModule: true, Root: make('div'), Anchor: make('div'), Content: make('div'), Popper: make('div') }));
vi.mock('@radix-ui/react-dismissable-layer', () => ({ __esModule: true, Root: make('div'), DismissableLayer: make('div') }));
vi.mock('@radix-ui/react-focus-scope', () => ({ __esModule: true, FocusScope: (p:any) => p.children }));
vi.mock('@radix-ui/react-presence', () => ({ __esModule: true, Presence: (p:any) => p.children }));
vi.mock('@radix-ui/react-portal', () => ({ __esModule: true, Portal: (p:any) => p.children }));
vi.mock('react-remove-scroll', () => ({ __esModule: true, RemoveScroll: (p:any) => p.children, default: (p:any) => p.children }));

const originalError = console.error;
console.error = (...args: any[]) => {
  const msg = args[0];
  if (typeof msg === 'string' && msg.includes('not wrapped in act')) return;
  originalError(...args);
};
