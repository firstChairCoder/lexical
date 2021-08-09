/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 */

import type {OutlineEditor} from 'outline';
import type {EventHandler} from './shared/EventHandlers';

import useLayoutEffect from './shared/useLayoutEffect';

export type InputEvents = Array<[string, EventHandler]>;

function getTarget(eventName: string, rootElement: HTMLElement): EventTarget {
  return eventName === 'selectionchange' ||
    eventName === 'keyup' ||
    eventName === 'pointerup' ||
    eventName === 'pointercancel'
    ? rootElement.ownerDocument
    : rootElement;
}

export default function useOutlineEditorEvents(
  events: InputEvents,
  editor: OutlineEditor,
  isReadOnly: boolean,
): void {
  useLayoutEffect(() => {
    if (isReadOnly) {
      return;
    }
    const create = [];
    const destroy = [];

    for (let i = 0; i < events.length; i++) {
      const [eventName, handler] = events[i];

      const handlerWrapper = (event: Event) => {
        handler(event, editor);
      };
      create.push((rootElement: HTMLElement) => {
        getTarget(eventName, rootElement).addEventListener(
          eventName,
          handlerWrapper,
        );
      });
      destroy.push((rootElement: HTMLElement) => {
        getTarget(eventName, rootElement).removeEventListener(
          eventName,
          handlerWrapper,
        );
      });
    }

    return editor.addListener(
      'root',
      (
        rootElement: null | HTMLElement,
        prevRootElement: null | HTMLElement,
      ) => {
        if (prevRootElement !== null) {
          destroy.forEach((fn) => fn(prevRootElement));
        }
        if (rootElement !== null) {
          create.forEach((fn) => fn(rootElement));
        }
      },
    );
  }, [editor, events, isReadOnly]);
}
