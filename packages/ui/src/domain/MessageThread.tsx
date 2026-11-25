import type { ComponentProps, ReactNode, Ref } from 'react';
import { cx } from '../foundation/cx';

export interface MessageThreadItem {
  /** Stable within this thread; also used by the host to locate a scroll anchor. */
  id: string;
  text?: string;
  /** Rich comment content supplied by the host; plain chat uses text. */
  content?: ReactNode;
  avatar?: ReactNode;
  author?: ReactNode;
  time?: ReactNode;
  dateTime?: string;
  own?: boolean;
  attachments?: ReactNode;
  actions?: ReactNode;
  /** Measures the actual message row; does not imply that the message has been read. */
  ref?: Ref<HTMLElement>;
}

export interface MessageThreadProps extends Omit<ComponentProps<'ol'>, 'children'> {
  label: string;
  items: readonly MessageThreadItem[];
  variant?: 'bubble' | 'comment';
  empty?: ReactNode;
}

/** Controlled view shared by chat messages and task comments; no transport, scrolling or read receipts. */
export function MessageThread({ label, items, variant = 'bubble', empty, className, ...rest }: MessageThreadProps) {
  return (
    <ol {...rest} className={cx('ds-message-thread', `ds-message-thread--${variant}`, className)} aria-label={label}>
      {items.length === 0 && empty != null && <li className="ds-message-thread-empty">{empty}</li>}
      {items.map((item) => {
        const time = item.time != null ? <time dateTime={item.dateTime}>{item.time}</time> : null;
        return (
          <li key={item.id} className={cx('ds-message-thread-item', item.own && 'is-own')}>
            <article ref={item.ref} data-message-id={item.id}>
              {variant === 'bubble' && time}
              <div className="ds-message-thread-row">
                {item.avatar != null && <div className="ds-message-thread-avatar">{item.avatar}</div>}
                <div className="ds-message-thread-body">
                  {(item.author != null || (variant === 'comment' && (time || item.actions != null))) && (
                    <header className="ds-message-thread-heading">
                      {item.author != null && <strong>{item.author}</strong>}
                      {variant === 'comment' && (
                        <>
                          {time}
                          {item.actions}
                        </>
                      )}
                    </header>
                  )}
                  {(item.text || item.content != null) && (
                    <div className="ds-message-thread-content">
                      {item.text && <p>{item.text}</p>}
                      {item.content}
                    </div>
                  )}
                  {item.attachments != null && <div className="ds-message-thread-attachments">{item.attachments}</div>}
                  {variant === 'bubble' && item.actions != null && (
                    <div className="ds-message-thread-actions">{item.actions}</div>
                  )}
                </div>
              </div>
            </article>
          </li>
        );
      })}
    </ol>
  );
}
